import { useState } from 'react';

interface ErrorCompilador {
  tipo: string;
  descripcion: string;
  linea: number;
  columna: number;
}

interface Simbolo {
  id: string;
  tipo: string;
  tipoDato: string;
  entorno: string;
  linea: number;
  columna: number;
}

function App() {
  const [codigo, setCodigo] = useState("// Escribe tu código de Go aquí...");
  const [consola, setConsola] = useState("");
  const [errores, setErrores] = useState<ErrorCompilador[]>([]);
  const [tablaSimbolos, setTablaSimbolos] = useState<Simbolo[]>([]);
  const [tabActiva, setTabActiva] = useState('consola');

  const ejecutarAnalisis = async () => {
    try {
      const response = await fetch('http://localhost:4000/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      const data = await response.json();
      
      setConsola(data.consola || "Ejecución finalizada.");
      setErrores(data.errores || []);
      setTablaSimbolos(data.simbolos || []); // El backend debe enviar esta lista
      
      if (data.errores?.length > 0) setTabActiva('errores');
      else setTabActiva('consola');
    } catch (err) {
      console.error("Error:", err);
      setConsola(" Error: No se pudo conectar con el servidor.");
    }
  };

  const generarAST = async () => {
    // Aquí podrías abrir una nueva pestaña con la imagen o el dot del AST
    alert("Generando archivo DOT del árbol AST...");
    // Lógica para pedir el AST al backend si lo tienes implementado
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <span className="icon"></span>
          <h1>Go Compiler</h1>
        </div>
        <div className="actions">
          <button className="btn-ast" onClick={generarAST}>🌳 Generar AST</button>
          <button className="btn-secondary" onClick={() => setCodigo("")}>Limpiar</button>
          <button className="btn-primary" onClick={ejecutarAnalisis}>▶ EJECUTAR</button>
        </div>
      </header>

      <main className="main-content">
        <section className="editor-section">
          <div className="label-bar">Editor de Código (.gst)</div>
          <textarea
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            spellCheck={false}
          />
        </section>

        <section className="output-section">
          <nav className="tabs">
            <button onClick={() => setTabActiva('consola')} className={tabActiva === 'consola' ? 'active' : ''}>Consola</button>
            <button onClick={() => setTabActiva('simbolos')} className={tabActiva === 'simbolos' ? 'active' : ''}>Símbolos</button>
            <button onClick={() => setTabActiva('errores')} className={tabActiva === 'errores' ? 'active' : ''}>Errores ({errores.length})</button>
          </nav>

          <div className="tab-content">
            {tabActiva === 'consola' && (
              <pre className="consola-text">{consola}</pre>
            )}

            {tabActiva === 'simbolos' && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Dato</th>
                      <th>Entorno</th>
                      <th>L/C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaSimbolos.length > 0 ? tablaSimbolos.map((s, i) => (
                      <tr key={i}>
                        <td>{s.id}</td>
                        <td className="txt-blue">{s.tipo}</td>
                        <td className="txt-green">{s.tipoDato}</td>
                        <td>{s.entorno}</td>
                        <td>{s.linea}/{s.columna}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} style={{textAlign:'center'}}>No hay símbolos generados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tabActiva === 'errores' && (
              <div className="error-list">
                {errores.length > 0 ? errores.map((err, i) => (
                  <div key={i} className="error-item">
                    <span className="error-tag">{err.tipo}</span>
                    <p>{err.descripcion}</p>
                    <small>Ubicación: Fila {err.linea}, Columna {err.columna}</small>
                  </div>
                )) : <p>No se encontraron errores </p>}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;