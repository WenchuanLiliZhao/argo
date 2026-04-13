import "./App.css";

const isMacElectron = window.argo?.platform === "darwin";

function App() {
  const content = (
    <main className="app">
      <h1>Argo</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR.
      </p>
    </main>
  );

  if (isMacElectron) {
    return (
      <div className="electron-shell">
        <div className="electron-titlebar" aria-hidden />
        {content}
      </div>
    );
  }

  return content;
}

export default App;
