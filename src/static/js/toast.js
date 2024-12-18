
/**
 * 显示一个 toast 提示
 * @param {String} message 提示消息 
 * @param {Number} duration 持续时间，默认为 3000 毫秒
 * @author ChatGPT大神🤣
 */
function showToast(message, duration = 3000) {
  const container = document.getElementById('toast-container');

  // 检查是否已经存在一个 toast
  const existingToast = container.querySelector('.toast');
  if (existingToast) {
    // 如果存在，先移除它
    existingToast.remove();
  }

  // 创建一个新的 toast 元素
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = message;

  // 将 toast 添加到容器中
  container.appendChild(toast);

  // 强制重新计算布局，以便应用显示动画
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // 在指定持续时间后隐藏并移除 toast
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, duration);
}