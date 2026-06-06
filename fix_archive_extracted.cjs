const fs = require('fs');
let code = fs.readFileSync('archive_logic_extracted.js', 'utf8');

const targetStartIndex = code.indexOf('if (id) {', code.indexOf('async function saveHoSo()'));
const targetEndIndex = code.indexOf('}', code.indexOf('renderLuuTruHoSo();', targetStartIndex)) + 1;

if (targetStartIndex !== -1 && targetEndIndex !== -1) {
    const targetString = code.substring(targetStartIndex, targetEndIndex);

    const replacement = `try {
        ` + targetString.replace(/closeHsEditModal\(\);\s*renderLuuTruHoSo\(\);\s*\}/, '') +
        `} catch (err) {
            console.error('Lỗi lưu hồ sơ:', err);
        } finally {
            closeHsEditModal();
            renderLuuTruHoSo();
        }`;

    fs.writeFileSync('archive_logic_extracted.js', code.replace(targetString, replacement));
    console.log('Done archive_logic_extracted.js');
} else {
    console.log('Not found in archive_logic_extracted.js');
}
