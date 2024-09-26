---
title: Parallelism with Semaphores in Bash
date: 2024-09-26
tags: [dev, bash]
---

I was reviewing the build scripts for an old project and unearthed one of my favorite bash scripts, written back when I was learning new bash tricks every day. Nowadays I would write a lot of this kind of thing in TypeScript or some other more structured language, but there's still a place in my heart for scripting right in the terminal... so: parallelism in bash!

The goal is to run a series of many "testing scripts", all written in bash, and to do so in parallel -- but a _controlled_ parallelism, with some configurable number (let's say 5) running at a time. One way to do this is to build a semaphore: a lock which can be locked N times, but when you try to lock it N+1 times, you have to wait until someone holding one of the N locks releases their lock.

### The main loop

```bash
abortParallelSpecs() {
    kill $CHILD_PIDS >/dev/null 2>&1
    wait $CHILD_PIDS >/dev/null 2>&1
    sleep 1
    exit 1
}

MAX_PARALLEL="$(getconf _NPROCESSORS_ONLN)"
let "MAX_PARALLEL=MAX_PARALLEL-2" "MAX_PARALLEL=(MAX_PARALLEL<2?2:MAX_PARALLEL)"

echo "Running unit tests across $MAX_PARALLEL cores..."

trap "abortParallelSpecs" EXIT
openSemaphore $MAX_PARALLEL

while read TEST_FILE; do
  runWithLock bash <<EOF
    "$TEST_FILE" >> $LOG_DIR/$TEST_FILE.log
EOF
  CHILD_PIDS="$CHILD_PIDS $!"
done < "$SPECS_FILE"

wait $CHILD_PIDS
```

This code skeleton sets the scene. We start by determining some number of parallel threads to run, ideally based on the available cores. Then, we set up a trap, so that exiting (Ctrl+C) the script will kill all of the running test processes. We create a semaphore with N slots, using the not-yet-defined `openSemaphore` function; then we loop through a big file listing our test scripts, calling the not-yet-defined `runWithLock` function on each one. As we trigger each script, we append it to a list of all child processes we've started, so at the very end we can wait for any stragglers to finish.

- The `getconf` trick is available "mostly anywhere" (linux, macos, git bash on windows).
- Note the `trap` line, which says "if you would exit, call this function instead".
- The `<<EOF / EOF` pair is called a _heredoc_ and lets you inject a multi-line string, in this case, a script run by bash.
- The `$!` magic variable contains the process id (PID) of the last command you ran in the background.

I've cut out some other details about printing the logged output, handling script arguments, etc., but this is the script in a nutshell. What's left is for us to define are these mysterious functions -- what exactly do `openSemaphore` and `runWithLock` _do?_.

### Opening the semaphore

```bash
openSemaphore() {
  mkfifo pipe-$$
  exec 3<>pipe-$$
  rm pipe-$$

  local i=$1
  for ((;i>0;i--)); do
    printf %s 000 >&3
  done
}
```

Now it gets interesting.

- First, we use `mkfifo` to create an _in-memory first-in-first-out file_. Basically, it's a pipe, not connected to anything, that lives in the operating system. To make sure it's unique, we name it using the value of the current PID (`$$`).
- Then, we use the `exec` command to map _input_ (`<`) and _output_ (`>`) from _file descriptor 3_ to our new pipe. There's nothing magic about FD 3; we can't touch file descriptors 0, 1, or 2 (as these are reserved for STDIN, STDOUT, and STDERR, respectively), but we could have chosen 4 or 5 or 6 instead. FD 3 is just the logical "next unused descriptor" for a typical bash script.
- Next, we _delete_ our in-memory pipe, as we don't need it anymore. This turns FD 3 itself into a pointer to a readable, writable, in-memory queue, which we can write characters to and read from later. More importantly, if we attempt to read from the file and there's no characters to read, it will _block until something is available_ -- a key part of our semaphore behavior.
- Finally, we fill up FD 3 with an initial set of characters. Here we are writing a magic value "000", for each requested parallelism slot. If we ran `openSemaphore 5` (for 5 parallel threads), we'd end up writing `000000000000000` (15 0's) into the file descriptor. We'll see why later.

To recap: we call `openSemaphore N`, which uses file descriptor 3 to create a _blocking queue_, initially filled with N\*3 zeroes (`0`).

### Using the semaphore

```bash
runWithLock() {
  local x

  read -u 3 -n 3 x && ((0==x)) || exit $x
  (
    # Execute the passed command
    ( "$@"; )

    printf "%.3d" $? >&3
  ) &
}
```

- The first thing we do is attempt to _read 3 characters from FD 3_. If there aren't 3 characters to read, waiting in the queue, this command will simply block until they are available. This is one reason we "prefilled" the queue in `openSemaphore` -- we want the first N commands that try to start to start up right away, instead of blocking.
- The value we read is _interpreted as a 3-digit number_ (`-n 3`). If it's not 0, we _exit_ with that exit code. Here we see the real meaning of these digits in the queue -- they represent the exit codes of the last completed commands. This feature allows us to "short circuit" all the rest of the commands we would run if any of our testing scripts exit with a non-zero exit code.
- Once we've read a value (which is, essentially, "obtaining a lock"), we kick off a process in the background (using the `&` symbol). This subprocess runs the test command we were passed, and when it's complete, prints its _exit code_ (formatted as a 3 digit number) into the queue. This is "releasing the lock", since it unblocks the next waiting process and allows it to run.

### More reading

This design was inspired by the answers to StackOverflow question [Parallelize a Bash FOR Loop](https://unix.stackexchange.com/questions/103920/parallelize-a-bash-for-loop) -- if curious, please check it out to see many different takes on this problem!
