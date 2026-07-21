document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.toggle-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const panel = document.getElementById(targetId);

      document.querySelectorAll('.toggle-panel').forEach((item) => {
        item.classList.remove('open');
      });

      if (panel) {
        panel.classList.add('open');
      }
    });
  });
});
