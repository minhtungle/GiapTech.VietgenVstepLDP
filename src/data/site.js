export const CONTACT = {
  email: 'tuyensinh.vstep@vietgeneducation.edu.vn',
  phone: '0866.538.942',
  phoneRaw: '0866538942',
  locations: 'Hà Nội - TP.HCM - Học online toàn quốc',
  facebook: 'https://www.facebook.com/vietgenacademy',
  zalo: 'https://zalo.me/0866538942',
  whatsapp: 'https://wa.me/840866538942',
}

export const NAV_ITEMS = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Test trình độ', to: '/test', highlight: true },
  {
    label: 'Giới thiệu',
    to: '/gioi-thieu',
    children: [
      { label: 'Về VietGen', to: '/gioi-thieu' },
      { label: 'Đội ngũ giảng viên', to: '/giang-vien' },
      { label: 'Chi tiết giảng viên', to: '/giang-vien/chi-tiet' },
    ],
  },
  {
    label: 'Khóa học',
    to: '/khoa-hoc',
    children: [
      { label: 'Danh sách khóa học', to: '/khoa-hoc' },
      { label: 'VSTEP B1 Cấp Tốc (chi tiết)', to: '/khoa-hoc/vstep-b1-cap-toc' },
    ],
  },
  {
    label: 'Tin tức',
    to: '/tin-tuc',
    children: [
      { label: 'Danh sách bài viết', to: '/tin-tuc' },
      { label: 'Chi tiết bài viết', to: '/tin-tuc/chi-tiet' },
    ],
  },
  { label: 'Liên hệ', to: '/lien-he' },
]

export const COURSE_OPTIONS = [
  'VSTEP B1 Cấp Tốc (9 buổi)',
  'VSTEP B2 Cấp Tốc (10 buổi)',
  'Cấp Tốc 1-1 (7 buổi)',
]

export const REGIONS = ['Hà Nội', 'TP.HCM', 'Học Online']

export const FOOTER_LINKS = {
  explore: [
    { label: 'VietGen', to: '/' },
    { label: 'Giới thiệu', to: '/gioi-thieu' },
    { label: 'Khóa học', to: '/khoa-hoc' },
    { label: 'Test trình độ', to: '/test' },
    { label: 'Giảng viên', to: '/giang-vien' },
    { label: 'Tin tức', to: '/tin-tuc' },
  ],
  courses: [
    { label: 'VSTEP B1 Cấp Tốc (9 buổi)', to: '/khoa-hoc/vstep-b1-cap-toc' },
    { label: 'VSTEP B2 Cấp Tốc (10 buổi)', to: '/khoa-hoc' },
    { label: 'Cấp Tốc 1-1 (7 buổi)', to: '/khoa-hoc' },
  ],
  branches: [
    { label: 'Hà Nội - Đống Đa', to: '/lien-he' },
    { label: 'TP.HCM - Quận 10 & Bình Thạnh', to: '/lien-he' },
    { label: 'Học online toàn quốc', to: '/lien-he' },
  ],
}
