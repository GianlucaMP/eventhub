import React from 'react';
import { BarChart3, Calendar, GraduationCap } from 'lucide-react';
const Sidebar = ({ seccion, onSeccionChange }) => (
  <aside className="sidebar">
    <a className="brand" href="#inicio" onClick={() => onSeccionChange('inicio')}>
      <span className="brand-icon"><GraduationCap size={24} /></span>
      <span><strong>EventHub</strong><small>Agenda académica</small></span>
    </a>
    <nav aria-label="Navegación principal">
      <a href="#inicio" aria-current={seccion === 'inicio' ? 'location' : undefined} onClick={() => onSeccionChange('inicio')}>
        <BarChart3 size={19} /> Inicio
      </a>
      <a href="#eventos" aria-current={seccion === 'eventos' ? 'location' : undefined} onClick={() => onSeccionChange('eventos')}>
        <Calendar size={19} /> Explorar eventos
      </a>
    </nav>
  </aside>
);

export default Sidebar;
