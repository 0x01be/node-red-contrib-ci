const GET = require('./common/docker-get');

const buildPath = function (msg, config) {
  const query = require('querystring').stringify({
    stream: config.stream
  });

  return `/containers/${msg.payload.container}/stats?${query}`;
}

const onData = function (node, msg) {
  const result = function (chunk) {
    if ((typeof chunk === 'string') && chunk !== '') {
      node.trace(chunk);

      try {
        const stats = JSON.parse(chunk);

        const payload = Object.assign({}, msg.payload);
        payload.workspace = undefined;
        payload.time = new Date();

        const computed = {};

        // See https://docs.docker.com/engine/api/v1.40/#operation/ContainerStats
        const memory_stats = stats.memory_stats;
        if (memory_stats) {
          computed.memory = {};
          if (memory_stats.limit) {
            computed.memory.available = memory_stats.limit / (1024*1024);
          }
          if (memory_stats.usage) {
            const cache = (memory_stats.stats && memory_stats.stats.cache) ? memory_stats.stats.cache : 0;
            computed.memory.used = (memory_stats.usage - cache) / (1024*1024);
          }
          if (computed.memory.available && computed.memory.used) {
            computed.memory.percent = (computed.memory.used / computed.memory.available) * 100.0;
          }
        }

        const cpu_stats = stats.cpu_stats;
        const precpu_stats = stats.precpu_stats;
        if (cpu_stats && cpu_stats.cpu_usage && precpu_stats && precpu_stats.cpu_usage) {
          computed.cpu = {};
          if (cpu_stats.cpu_usage.total_usage && precpu_stats.cpu_usage.total_usage) {
            computed.cpu.delta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
          }
          if (cpu_stats.system_cpu_usage && precpu_stats.system_cpu_usage) {
            computed.cpu.system = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;
          }
          if (computed.cpu.delta && computed.cpu.system && cpu_stats.online_cpus) {
            computed.cpu.percent = (computed.cpu.delta/computed.cpu.system) * cpu_stats.online_cpus * 100.0;
          }
        }

        payload.stats = stats;
        payload.computed = computed;

        node.send({
          _msgid: msg._msgid,
          payload: payload
        });
      } catch (error) {
        node.error(error);
      }
    }
  };

  return result;
};

module.exports = GET('container-stats', buildPath, onData);