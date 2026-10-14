export default function SectionTitle({ subTitle, title, desc, center = false, white = false }) {
  return (
    <div className={`sec-title${center ? ' text-center' : ''}`}>
      {subTitle && <div className={`sub-title${white ? ' white-color' : ' primary'}`}>{subTitle}</div>}
      {title && <h2 className={`title${white ? ' white-color' : ''}`}>{title}</h2>}
      {desc && <p className={`desc${white ? ' white-color' : ''}`}>{desc}</p>}
    </div>
  )
}
