import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Không Tìm Thấy Trang - VietGen"
        description="Trang bạn tìm không tồn tại hoặc đã được chuyển sang địa chỉ khác. Quay lại trang chủ VietGen để tiếp tục tìm hiểu các khóa luyện thi VSTEP."
      />
      <Breadcrumbs title="Không Tìm Thấy Trang" subText="Lỗi 404" />

      <div className="rs-inner-blog pt-100 pb-100 md-pt-70 md-pb-70">
        <div className="container">
          <div className="sec-title text-center">
            <h2 className="title mb-17">Rất tiếc, không tìm thấy trang này</h2>
            <div className="desc mb-30">
              Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi. Bạn có thể quay lại trang
              chủ hoặc xem danh sách khóa học VSTEP của VietGen.
            </div>
            <div className="btn-part">
              <Link className="readon banner-style" to="/">
                Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
