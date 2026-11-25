#!/usr/bin/env python3
"""Lấy bài học mới nhất của web lớp offline (Little Seed + Seedling 48 buổi) sang web Cuộc thi mùa 3 (23/11/2026).

    git clone --depth 1 https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu /tmp/nguon
    python3 cuoc-thi-mua-3/cong-cu/lay_bai_tu_web_offline.py /tmp/nguon        # chạy ở thư mục gốc kho cuộc thi
    python3 cuoc-thi-mua-3/cong-cu/lay_bai_tu_web_offline.py /tmp/nguon --thu  # chỉ báo sẽ đổi gì, không ghi

- Kho web lớp offline chỉ được ĐỌC: không sửa, không đẩy gì vào đó.
- Dựng lại bộ chạy bài 99 ngày bằng dung_bai_offline.py (cùng thư mục) nhưng ghi ra thư mục tạm, rồi chép
  cuoc-thi-mua-3/bai-ls/, bai-sd/, bai-offline.js vào kho này.
- Chép lại tranh, giọng, thư viện mà bài dùng (TAI_NGUYEN dưới đây), bỏ tệp không còn trong kho gốc.
- Không đụng: chang.js, chang-*/, quan-tri/, apps-script/, xep-hang, khen, qua, ol… (phần riêng của cuộc thi).
- Đây là thay đổi NỘI DUNG: làm trên nhánh mới và mở Pull Request cho chị Duyên duyệt (xem CLAUDE.md).
"""
import filecmp, importlib.util, os, shutil, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
KHO = os.path.abspath(os.path.join(HERE, '..', '..'))
TAI_NGUYEN = ['little-seed/tai-nguyen-ls', 'seedling/tai-nguyen', 'xem-truoc/img', 'xem-truoc/tai-nguyen',
              'chuong-trinh/ve48', 'lop-zoom/vendor']
BAI = ['bai-ls', 'bai-sd', 'bai-offline.js']


def so_sanh(a, b):
    """(thêm/sửa, xoá) khi đổi thư mục/tệp b thành a."""
    if os.path.isfile(a):
        return ([b] if not os.path.isfile(b) or not filecmp.cmp(a, b, shallow=False) else []), []
    moi, bo = [], []
    for g, _, fs in os.walk(a):
        for f in fs:
            p = os.path.join(g, f); q = os.path.join(b, os.path.relpath(p, a))
            if not os.path.isfile(q) or not filecmp.cmp(p, q, shallow=False): moi.append(q)
    if os.path.isdir(b):
        for g, _, fs in os.walk(b):
            for f in fs:
                q = os.path.join(g, f)
                if not os.path.exists(os.path.join(a, os.path.relpath(q, b))): bo.append(q)
    return moi, bo


def chep(a, b):
    if os.path.isdir(b): shutil.rmtree(b)
    elif os.path.exists(b): os.remove(b)
    os.makedirs(os.path.dirname(b), exist_ok=True)
    (shutil.copytree if os.path.isdir(a) else shutil.copy2)(a, b)


def main():
    if len(sys.argv) < 2 or not os.path.isfile(os.path.join(sys.argv[1], 'little-seed', 'index.html')):
        sys.exit('Cần đường dẫn tới bản clone kho web lớp offline (có little-seed/index.html).')
    nguon = os.path.abspath(sys.argv[1]); thu = '--thu' in sys.argv
    spec = importlib.util.spec_from_file_location('dung', os.path.join(HERE, 'dung_bai_offline.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    with tempfile.TemporaryDirectory() as tam:
        out = os.path.join(tam, 'cuoc-thi-mua-3'); os.makedirs(os.path.join(out, 'cong-cu'))
        shutil.copy(os.path.join(HERE, 'nhung.js'), os.path.join(out, 'cong-cu', 'nhung.js'))
        m.ROOT, m.OUT = nguon, out
        data = {}
        for src_dir, out_dir, key, data_file, server_file in m.ENGINES:
            m.build(src_dir, out_dir, key, data_file, server_file)
            data[out_dir[4:]] = m.meta(src_dir, data_file)
        import json
        with open(os.path.join(out, 'bai-offline.js'), 'w', encoding='utf-8') as f:
            f.write('/* Sinh tự động bằng cong-cu/dung_bai_offline.py: 99 ngày của web lớp offline (ls = Little Seed, sd = Seedling 48 buổi). Đừng sửa tay. */\n')
            f.write('window.M3_OL=' + json.dumps(data, ensure_ascii=False) + ';\n')
        viec = [(os.path.join(out, x), os.path.join(KHO, 'cuoc-thi-mua-3', x)) for x in BAI]
        viec += [(os.path.join(nguon, x), os.path.join(KHO, x)) for x in TAI_NGUYEN if os.path.exists(os.path.join(nguon, x))]
        tong_moi = tong_bo = 0
        for a, b in viec:
            moi, bo = so_sanh(a, b); tong_moi += len(moi); tong_bo += len(bo)
            if moi or bo: print('%-32s thêm/sửa %4d · xoá %4d' % (os.path.relpath(b, KHO), len(moi), len(bo)))
            if not thu and (moi or bo): chep(a, b)
        print(('SẼ ĐỔI' if thu else 'ĐÃ ĐỔI'), tong_moi, 'tệp, xoá', tong_bo, 'tệp.' if tong_moi + tong_bo else '(không có gì mới)')
    if not thu:   # dựng lại "Hướng dẫn quay clip · 2 cách" theo câu của bài mới (huong-dan-nop-bai.js)
        import subprocess
        try: subprocess.run(['node', os.path.join(HERE, 'tao_huong_dan_nop_bai.js')], check=True)
        except Exception as e: print('CHÚ Ý: chưa dựng lại huong-dan-nop-bai.js (' + str(e) + '); chạy tay: node cuoc-thi-mua-3/cong-cu/tao_huong_dan_nop_bai.js')


if __name__ == '__main__':
    main()
