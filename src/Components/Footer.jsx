import { useEffect, useRef, useState } from 'react';
import { FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import '../styles/Footer.css'; 

const URLConfig = 'http://localhost:3001/api/config';

export default function Footer() {
  const [config, setConfig] = useState(null);
  const [oculto, setOculto] = useState(false);
  const prevScroll = useRef(0);
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(URLConfig)
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const actualScroll = window.scrollY;
      setOculto(actualScroll > prevScroll.current);
      prevScroll.current = actualScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!config) return null;

  const redes = [
    { check: config.igCheck, url: config.igTexto, icon: <FaInstagram />, label: 'Instagram' },
    { check: config.xCheck, url: config.xTexto, icon: <FaXTwitter />, label: 'X/Twitter' },
    { check: config.fbCheck, url: config.fbTexto, icon: <FaFacebook />, label: 'Facebook' },
    { check: config.ttCheck, url: config.ttTexto, icon: <FaTiktok />, label: 'TikTok' },
    { check: config.wpCheck, url: `https://wa.me/${config.wpTexto}`, icon: <FaWhatsapp />, label: 'WhatsApp' },
    { check: config.emailCheck, url: `mailto:${config.emailTexto}`, icon: <IoIosMail />, label: 'Email' }
  ];

  return (
    <footer className={`footer ${oculto ? 'oculto' : ''}`} style={{ background: config.colorPrincipal }}>
      {role === "admin" && (<a href="/admin" className="nav-button" style={{ color: config.fuentePrincipal}}>PANEL DE ADMINISTRACION</a>)}
      <p style={{ color: config.fuentePrincipal }}>
        &copy; 2025 {config.nombreTienda} - Todos los derechos reservados
      </p>
      
      <div className="footer-redes">
        {redes
          .filter(r => r.check && r.url)
          .map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: config.fuentePrincipal}}
            >
              <span role="img" aria-label={r.label}>{r.icon}</span>
            </a>
          ))}
          <p>{config.emailTexto}</p>

          <p>by WebEcomm</p>
      </div>
    </footer>
  );
}
