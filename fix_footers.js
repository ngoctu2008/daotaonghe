const fs = require('fs');

// Fix Index.html
let html1 = fs.readFileSync('/app/gas_project/Index.html', 'utf8');
const oldFooter1 = `<div style="text-align: center; padding: 20px; color: #6c757d; font-size: 0.9rem; margin-top: 40px; border-top: 1px solid #dee2e6;">
            Thiết kế và vận hành bởi: Phạm Ngọc Tú - Mọi chi tiết xin liên hệ email: ngoctu.dnkd@gmail.com
        </div>`;
html1 = html1.replace(oldFooter1, "");
// Add to body end before scripts
html1 = html1.replace('<!-- Scripts -->', `</div> <!-- End content-area -->\n\n<div style="width: 100%; text-align: center; padding: 15px; color: #6c757d; font-size: 0.85rem; border-top: 1px solid #dee2e6; background-color: #f8f9fa; position: relative; bottom: 0; left: 0;">\nThiết kế và vận hành bởi: Phạm Ngọc Tú - Mọi chi tiết xin liên hệ email: ngoctu.dnkd@gmail.com\n</div>\n\n<!-- Scripts -->`);
// Clean up a duplicate End content-area if we injected wrong
html1 = html1.replace('</div> <!-- End content-area -->\n\n</div> <!-- End content-area -->', '</div> <!-- End content-area -->');

fs.writeFileSync('/app/gas_project/Index.html', html1);


// Fix StudentRegister.html
let html2 = fs.readFileSync('/app/gas_project/StudentRegister.html', 'utf8');
const oldFooter2 = `<div style="text-align: center; padding: 15px; color: #6c757d; font-size: 0.85rem; border-top: 1px solid #dee2e6; background-color: #f8f9fa;">
          Thiết kế và vận hành bởi: Phạm Ngọc Tú - Mọi chi tiết xin liên hệ email: ngoctu.dnkd@gmail.com
      </div>`;
html2 = html2.replace(oldFooter2, "");
html2 = html2.replace('</body>', `<div style="width: 100%; text-align: center; padding: 15px; color: #6c757d; font-size: 0.85rem; border-top: 1px solid #dee2e6; background-color: #f8f9fa; position: relative; bottom: 0; left: 0; margin-top: 40px;">\nThiết kế và vận hành bởi: Phạm Ngọc Tú - Mọi chi tiết xin liên hệ email: ngoctu.dnkd@gmail.com\n</div>\n</body>`);

fs.writeFileSync('/app/gas_project/StudentRegister.html', html2);
