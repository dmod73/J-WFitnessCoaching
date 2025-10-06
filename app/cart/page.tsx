export default function CartPage() {
  return (
    <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <div className="feature-card" style={{ width: 'min(520px, 100%)', display: 'grid', gap: 18 }}>
        <span className="section-title">Carrito</span>
        <h1 style={{ margin: 0 }}>Tus cursos guardados</h1>
        <p className="link-muted">
          Aun no agregaste programas. Cuando selecciones un plan lo veras aqui listo para completar el pago.
        </p>
      </div>
    </main>
  );
}



