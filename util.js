const fs = require('fs');
const path = require('path');

//HTML TEMPLATE HANDLER
function render(templateName, data) {
  let tmpl = fs.readFileSync(
    path.join(__dirname, 'templates', templateName + '.html'),
    'utf8',
  );

  console.log(
    path.join(__dirname, 'templates', templateName + '.html'),
    'log from file',
  );

  for (const key in data) {
    tmpl = tmpl.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  }
  return tmpl;
}

module.exports = {
  render,
};
