import { useEffect, useRef, useState } from 'react';
import { createRegistration } from '../services/registrationsApi.js';

const camposVacios = { nombre: '', email: '' };

export const useEventRegistration = (onCatalogChange) => {
  const [seleccion, setSeleccion] = useState(null);
  const [campos, setCampos] = useState(camposVacios);
  const [enviando, setEnviando] = useState(false);
  const [errorInscripcion, setErrorInscripcion] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const nombreInput = useRef(null);
  const confirmacionRef = useRef(null);
  const botonInscripcion = useRef(null);

  useEffect(() => {
    if (seleccion !== null) nombreInput.current?.focus({ preventScroll: true });
  }, [seleccion]);

  useEffect(() => {
    if (confirmacion) confirmacionRef.current?.focus();
  }, [confirmacion]);

  const elegirEvento = (evento, boton) => {
    if (seleccion === evento.id) {
      setSeleccion(null);
      botonInscripcion.current?.focus();
    } else {
      botonInscripcion.current = boton;
      setSeleccion(evento.id);
    }
    setCampos(camposVacios);
    setErrorInscripcion('');
    setConfirmacion('');
  };

  const inscribir = async (event, evento) => {
    event.preventDefault();
    if (enviando) return;
    const nombre = campos.nombre.trim();
    const email = campos.email.trim();
    if (!nombre || !email) {
      setErrorInscripcion('Ingresá tu nombre y tu correo electrónico.');
      return;
    }
    setEnviando(true);
    setErrorInscripcion('');

    try {
      const { confirmada, error } = await createRegistration(evento.id, { nombre, email });

      if (confirmada) {
        setSeleccion(null);
        setCampos(camposVacios);
        setConfirmacion(evento.titulo);
        onCatalogChange();
      } else {
        setErrorInscripcion(error?.mensaje || 'No pudimos confirmar la inscripción. Intentá nuevamente.');
        if (error?.codigo === 'EVENTO_SIN_CUPO') onCatalogChange();
      }
    } catch {
      setErrorInscripcion('No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const cambiarCampo = (nombre, valor) => {
    setCampos((actuales) => ({ ...actuales, [nombre]: valor }));
  };

  return {
    seleccion, enviando, elegirEvento,
    campos, cambiarCampo, errorInscripcion, nombreInput, inscribir,
    confirmacion, confirmacionRef,
  };
};
