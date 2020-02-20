export default function findBootstrapEnvironment() {
  const envs = ['xs', 'sm', 'md', 'lg'];
  const elem = jQuery('<div></div>');
  elem.appendTo(jQuery('div#fmi-warnings'));
  for (let i = envs.length - 1; i >= 0; i--) {
    const env = envs[i];
    elem.addClass(`hidden-${env}`);
    if (elem.is(':hidden')) {
      elem.remove();
      return env;
    }
  }
}
