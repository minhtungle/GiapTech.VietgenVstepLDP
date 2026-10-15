import { CONTACT } from '../data/site.js'

export default function FloatingContact() {
  return (
    <div className="vg-floating-contact">
      <a
        href={CONTACT.zalo}
        target="_blank"
        rel="noopener noreferrer"
        className="vg-float-btn vg-float-zalo"
        aria-label="Chat Zalo"
      >
        <svg viewBox="0 0 64 28" width="40" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* Chữ "Zalo" vẽ thẳng bằng path để không phụ thuộc font của máy người xem. */}
          <path
            fill="#0068ff"
            d="M1.6 2.2h15.1v3.6L6.9 20.1h10.2v4.1H1.1v-3.6L10.9 6.3H1.6V2.2Z
               M31.3 9.1h4.3v15.1h-4.1l-.2-1.9a6.3 6.3 0 0 1-5 2.3c-4.1 0-7.2-3.3-7.2-7.9s3.1-7.9 7.2-7.9c2.1 0 3.9.8 5 2.3V9.1Zm-4 11.6c2.2 0 3.8-1.7 3.8-4.1s-1.6-4.1-3.8-4.1-3.8 1.7-3.8 4.1 1.6 4.1 3.8 4.1Z
               M39.7 1.1h4.3v23.1h-4.3V1.1Z
               M55.3 24.6c-4.6 0-8.1-3.4-8.1-7.9s3.5-7.9 8.1-7.9 8.1 3.4 8.1 7.9-3.5 7.9-8.1 7.9Zm0-3.9c2.2 0 3.8-1.7 3.8-4s-1.6-4-3.8-4-3.8 1.7-3.8 4 1.6 4 3.8 4Z"
          />
        </svg>
      </a>
      <a
        href={CONTACT.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="vg-float-btn vg-float-facebook"
        aria-label="Facebook VietGen"
      >
        <i className="fa fa-facebook" />
      </a>
      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="vg-float-btn vg-float-whatsapp"
        aria-label="Chat WhatsApp"
      >
        <i className="fa fa-whatsapp" />
      </a>
    </div>
  )
}
