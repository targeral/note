process.stdin.resume();

process.on('SIGINT', () => {
  console.log('接收到 SIGINT。 按 Control-D 退出。');
});