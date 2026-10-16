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
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState('');
  const [instrumento, setInstrumento] = useState('');
  const [marcaSerie, setMarcaSerie] = useState('');
  const [estadoInstrumento, setEstadoInstrumento] = useState('Excelente');

  // ESTADOS PARA EDICIÓN
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
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
    setEditDocumento(integrante.documento || '');
    setEditCelular(integrante.celular || '');
    setEditInstrumento(integrante.instrumento || '');
    setEditMarcaSerie(integrante.marca_serie || '');
    setEditEstadoInstrumento(integrante.estado_instrumento || 'Excelente');
  };

  // GUARDAR CAMBIOS DE EDICIÓN
  const guardarEdicion = async (id: string) => {
    const { error } = await supabase
      .from('integrantes')
      .update({
        nombre: editNombre.trim(),
        documento: editDocumento.trim(),
        celular: editCelular.trim(),
        instrumento: editInstrumento.trim(),
        marca_serie: editMarcaSerie.trim(),
        estado_instrumento: editEstadoInstrumento,
      })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }

    setEditandoId(null);
    cargarDatos();
  };

  const eliminarIntegrante = async (id: string) => {
    if (!sesion) {
      alert('Debes ser Administrador para eliminar registros.');
      return;
    }

    const confirmar = window.confirm('¿Seguro que deseas eliminar este integrante?');
    if (!confirmar) return;

    const { error } = await supabase.from('integrantes').delete().eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }

    setIntegrantes(integrantes.filter((integrante) => integrante.id !== id));
  };

  const filtrados = integrantes.filter(
    (integrante) => integrante.proceso === procesoActivo
  );

  const inputStyle =
    'w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-white outline-none focus:border-amber-500';

  const editInputStyle =
    'w-full bg-slate-900 p-2 rounded-lg border border-slate-700 text-white text-xs outline-none focus:border-amber-500 mb-2';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          CODART - Gestión de Integrantes
        </h1>
        <div>
          {sesion ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800">
                Admin: {sesion.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-rose-600/25 hover:bg-rose-600/35 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-800 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-4 py-2 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              🔐 Iniciar Sesión Admin
            </button>
          )}
        </div>
      </div>

      {/* MODAL LOGIN */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button
              type="button"
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              Acceso Administrador
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                required
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3 rounded-xl text-sm transition cursor-pointer"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PESTAÑAS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {['Banda Filarmónica', 'Banda de Marcha', 'Prebanda'].map((p) => (
          <button
            key={p}
            onClick={() => setProcesoActivo(p)}
            className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${
              procesoActivo === p
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORMULARIO */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">
            Registrar en {procesoActivo}
          </h2>

          {!sesion && (
            <p className="text-xs text-amber-400/90 bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/50 mb-4">
              ⚠️ Inicia sesión como administrador para habilitar el guardado en la nube.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Documento"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className={inputStyle}
            />
            <input
              type="tel"
              placeholder="Número de celular"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className={inputStyle}
            />
            <input
              type="text"
              placeholder="Instrumento"
              value={instrumento}
              onChange={(e) => setInstrumento(e.target.value)}
              className={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Marca y Serie"
              value={marcaSerie}
              onChange={(e) => setMarcaSerie(e.target.value)}
              className={inputStyle}
            />
            <select
              value={estadoInstrumento}
              onChange={(e) => setEstadoInstrumento(e.target.value)}
              className={inputStyle}
            >
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
            <button
              type="submit"
              disabled={!sesion}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-xl transition font-bold"
            >
              Enviar
            </button>
          </form>
        </div>

        {/* LISTA (PROTEGIDA POR SESIÓN) */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Integrantes</h2>
              <p className="text-sm text-slate-400">{procesoActivo}</p>
            </div>
            {sesion && (
              <span className="bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-amber-400 text-sm">
                {filtrados.length}
              </span>
            )}
          </div>

          {!sesion ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <p className="text-3xl">🔒</p>
              <p className="font-semibold text-white">Información Protegida</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Inicia sesión como administrador para ver y gestionar la lista de integrantes de este proceso.
              </p>
            </div>
          ) : cargando ? (
            <div className="text-center py-10 text-slate-400">Cargando...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No hay integrantes registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {filtrados.map((integrante) => (
                <div
                  key={integrante.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                >
                  {editandoId === integrante.id ? (
                    /* MODO EDICIÓN */
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-amber-400 mb-1">Editando información:</p>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className={editInputStyle}
                        placeholder="Nombre completo"
                      />
                      <input
                        type="text"
                        value={editDocumento}
                        onChange={(e) => setEditDocumento(e.target.value)}
                        className={editInputStyle}
                        placeholder="Documento"
                      />
                      <input
                        type="tel"
                        value={editCelular}
                        onChange={(e) => setEditCelular(e.target.value)}
                        className={editInputStyle}
                        placeholder="Celular"
                      />
                      <input
                        type="text"
                        value={editInstrumento}
                        onChange={(e) => setEditInstrumento(e.target.value)}
                        className={editInputStyle}
                        placeholder="Instrumento"
                      />
                      <input
                        type="text"
                        value={editMarcaSerie}
                        onChange={(e) => setEditMarcaSerie(e.target.value)}
                        className={editInputStyle}
                        placeholder="Marca y Serie"
                      />
                      <select
                        value={editEstadoInstrumento}
                        onChange={(e) => setEditEstadoInstrumento(e.target.value)}
                        className={editInputStyle}
                      >
                        <option value="Excelente">Excelente</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                      </select>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => guardarEdicion(integrante.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          💾 Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* MODO VISTA NORMAL */
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white">{integrante.nombre}</h3>
                        <p className="text-sm text-amber-400 mt-1">
                          🎵 {integrante.instrumento}
                        </p>
                        {integrante.documento && (
                          <p className="text-xs text-slate-400 mt-1">
                            Documento: {integrante.documento}
                          </p>
                        )}
                        {integrante.celular && (
                          <p className="text-xs mt-1">
                            <a
                              href={`https://wa.me/57${integrante.celular.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                              title="Abrir WhatsApp"
                            >
                              💬 Celular: {integrante.celular}
                            </a>
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          Marca / Serie: {integrante.marca_serie || 'No especificada'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Estado: {integrante.estado_instrumento}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 items-center justify-center">
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(integrante)}
                          className="text-amber-400 hover:text-amber-300 p-1.5 text-sm cursor-pointer"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarIntegrante(integrante.id)}
                          className="text-rose-400 hover:text-rose-300 p-1.5 text-sm cursor-pointer"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}