/** Dải tiêu đề đầu trang, dùng lại class của template cho đồng bộ giao diện. */
export default function Breadcrumbs({ title, subText }) {
  return (
    <div className="rs-breadcrumbs img1">
      <div className="container">
        <div className="breadcrumbs-inner">
          <h1 className="page-title">{title}</h1>
          {subText && <span className="sub-text">{subText}</span>}
        </div>
      </div>
    </div>
  )
}
