import { useCallback, useEffect, useRef, useState } from 'react';
import { getEvents } from '../services/eventsApi.js';

export const useEvents = () => {
  const [eventos, setEventos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState('');
  const lectura = useRef(null);

  const cargarEventos = useCallback(async () => {
    lectura.current?.abort();
    const controller = new AbortController();
    lectura.current = controller;
    setCargando(true);
    setErrorCatalogo('');

    try {
      const datos = await getEvents(controller.signal);
      if (!controller.signal.aborted) setEventos(datos);
    } catch {
      if (!controller.signal.aborted) setErrorCatalogo('No pudimos cargar los eventos. Intentá nuevamente.');
    } finally {
      if (!controller.signal.aborted) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
    return () => lectura.current?.abort();
  }, [cargarEventos]);

  return { eventos, cargando, errorCatalogo, cargarEventos };
};
