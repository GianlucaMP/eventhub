import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';
import EventCatalog from '../features/events/components/EventCatalog.jsx';

const HomePage = () => {
  const [seccion, setSeccion] = useState('inicio');

  return (
    <DashboardLayout
      sidebar={<Sidebar seccion={seccion} onSeccionChange={setSeccion} />}
      header={<header className="topbar"><h1>Agenda académica</h1></header>}
    >
      <EventCatalog>
        <section className="hero" aria-labelledby="hero-titulo">
          <div><h2 id="hero-titulo">Descubrí talleres y charlas</h2><p>Elegí un evento y reservá tu lugar.</p></div>
          <span className="hero-icon" aria-hidden="true"><GraduationCap size={49} /></span>
        </section>
      </EventCatalog>
    </DashboardLayout>
  );
};

export default HomePage;
