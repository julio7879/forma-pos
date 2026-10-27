import React from 'react';

export function App() {
  return (
    <div className="min-h-screen bg-canvas text-graphite font-sans">
      <header className="border-b border-canvas-dark p-4 bg-white flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight text-graphite">FORMA POS & Tienda</h1>
        <nav className="space-x-4 text-sm font-medium">
          <a href="/tienda" className="hover:text-electric">Tienda</a>
          <a href="/seguimiento" className="hover:text-electric">Seguimiento</a>
          <a href="/pos" className="hover:text-electric">POS</a>
          <a href="/admin" className="hover:text-electric">Admin</a>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <p className="text-graphite-light">Enrutador principal de la plataforma FORMA.</p>
      </main>
    </div>
  );
}

export default App;
