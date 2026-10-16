'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [procesoActivo, setProcesoActivo] = useState('Banda Filarmónica');
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Autenticación de Administrador
  const [sesion, setSesion] = useState<any>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Formulario (Creación)
  const [nombre, setNombre] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('C.C.');
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState('');
  const [instrumento, setInstrumento] = useState('');
  const [marcaSerie, setMarcaSerie] = useState('');
  const [estadoInstrumento, setEstadoInstrumento] = useState('Excelente');

  // ESTADOS PARA EDICIÓN
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipoDocumento, setEditTipoDocumento] = useState('C.C.');
  const [editDocumento, setEditDocumento] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editInstrumento, setEditInstrumento] = useState('');
  const [editMarcaSerie, setEditMarcaSerie] = useState('');
  const [editEstadoInstrumento, setEditEstadoInstrumento] = useState('Excelente');

  useEffect(() => {
    cargarDatos();
    verificarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verificarSesion = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSesion(session);
  };

  const cargarDatos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('integrantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando datos:', error.message);
    }
    if (data) {
      setIntegrantes(data);
    }
    setCargando(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      setMostrarModal(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error al cerrar sesión: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesion) {
      alert('Debes iniciar sesión como Administrador para registrar información en la nube.');
      return;
    }
    if (!nombre.trim() || !instrumento.trim()) {
      alert('El nombre y el instrumento son obligatorios.');
      return;
    }

    const { data, error } = await supabase
      .from('integrantes')
      .insert([
        {
          nombre: nombre.trim(),
          tipo_documento: tipoDocumento,
          documento: documento.trim(),
          celular: celular.trim(),
          proceso: procesoActivo,
          instrumento: instrumento.trim(),
          marca_serie: marcaSerie.trim() || 'No especificada',
          estado_instrumento: estadoInstrumento,
        },
      ])
      .select();

    if (error) {
      alert('Error al guardar en Supabase: ' + error.message);
      return;
    }

    if (data) {
      cargarDatos();
      setNombre('');
      setTipoDocumento('C.C.');
      setDocumento('');
      setCelular('');
      setInstrumento('');
      setMarcaSerie('');
      setEstadoInstrumento('Excelente');
    }
  };

  // INICIAR EDICIÓN
  const iniciarEdicion = (integrante: any) => {
    setEditandoId(integrante.id);
    setEditNombre(integrante.nombre || '');
    setEditTipoDocumento(integrante.tipo_documento || 'C.C.');
    setEditDocumento(integrante.document