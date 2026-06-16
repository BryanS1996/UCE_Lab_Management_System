import React from 'react';
import { Outlet } from 'react-router-dom';
import { FlaskConical, Calendar, Users, BarChart3, ShieldCheck } from 'lucide-react';
import loginBg from '../assets/login_laboratory_bg.png';
import uceLogo from '../assets/uce_logo.png';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      
      {/* COLUMNA IZQUIERDA: Formulario de Autenticación */}
      <div className="flex-1 lg:max-w-[48%] bg-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative">
        <div className="flex-1 flex flex-col justify-center items-center max-w-md w-full mx-auto">
          {/* Logo del Sistema */}
          <div className="flex flex-col items-center mb-8 select-none">
            <div className="mb-4">
              <img src={uceLogo} alt="UCE Logo" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              UCE Lab
            </h1>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest mt-1.5">
              Management System
            </span>
          </div>

          {/* Contenido dinámico (Login, Registro, etc.) */}
          <div className="w-full">
            <Outlet />
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="text-center text-xs text-slate-400 mt-8 select-none">
          <p>© 2026 UCE Lab Management System</p>
          <p className="mt-1">Todos los derechos reservados</p>
        </div>
      </div>

      {/* COLUMNA DERECHA: Imagen de laboratorio y características (Oculto en móvil) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950">
        {/* Imagen de fondo con opacidad */}
        <img
          src={loginBg}
          alt="Science Laboratory"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105 transition-transform duration-[10s] hover:scale-100"
        />

        {/* Capa de degradado azul marino */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-950/95 to-slate-950"></div>

        {/* Elemento decorativo de hexágonos SVG en el fondo */}
        <svg
          className="absolute right-0 top-0 w-96 h-96 text-white/5 opacity-10 pointer-events-none"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,1 95,25 95,75 50,99 5,75 5,25" />
        </svg>
        <svg
          className="absolute left-10 bottom-10 w-64 h-64 text-blue-500/5 opacity-10 pointer-events-none"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <polygon points="50,1 95,25 95,75 50,99 5,75 5,25" />
        </svg>

        {/* Contenido del Panel */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-16 xl:px-24 text-left">
          <div className="max-w-xl">
            {/* Título Principal */}
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Gestión inteligente
            </h2>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mt-1">
              de laboratorios
            </h2>
            
            {/* Barra azul decorativa */}
            <div className="w-16 h-1 bg-blue-500 rounded-full mt-6"></div>

            <p className="text-lg text-slate-300 font-medium mt-6 leading-relaxed">
              Reserva, administra y optimiza el uso de laboratorios académicos
            </p>

            {/* Lista de características en tarjetas Glassmorphic */}
            <div className="mt-12 space-y-5">
              
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Reservas simples</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-normal">
                    Reserva laboratorios de forma rápida y sencilla.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Gestión de usuarios</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-normal">
                    Control de roles y permisos para estudiantes, docentes y personal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Reportes y estadísticas</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-normal">
                    Visualiza el uso de laboratorios con reportes detallados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/10">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Seguro y confiable</h4>
                  <p className="text-sm text-slate-400 mt-1 leading-normal">
                    Sistema seguro con autenticación y autorización avanzada.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
