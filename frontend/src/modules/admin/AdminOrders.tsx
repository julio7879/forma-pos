import { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/apiClient';
import { formatCOP } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge';
import { OrderDetailModal } from './OrderDetailModal';

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [filterState, setFilterState] = useState<string>('TODOS');
  const [filterChannel, setFilterChannel] = useState<string>('TODOS');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateState = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { estado_pedido: newStatus });
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado_pedido: newStatus } : o));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, estado_pedido: newStatus } : prev);
    } catch (error: any) {
      alert(error.message || "Error al actualizar el estado del pedido.");
    }
  };

  const stateTabs = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'RECIBIDO', label: 'Recibido' },
    { id: 'EN_PREPARACION', label: 'En preparación' },
    { id: 'LISTO', label: 'Listo' },
    { id: 'ENTREGADO', label: 'Entregado' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchState = filterState === 'TODOS' || o.estado_pedido === filterState;
      const matchChannel = filterChannel === 'TODOS' || o.origen === filterChannel;
      const matchQuery = 
        o.referencia.toLowerCase().includes(search.toLowerCase()) ||
        o.cliente_nombre.toLowerCase().includes(search.toLowerCase());
      return matchState && matchChannel && matchQuery;
    });
  }, [orders, filterState, filterChannel, search]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-cream">Gestión de Pedidos</h1>
        <p className="text-sm text-cream/60">Control de producción y entregas del taller.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface/30 border border-accent/15">
          {stateTabs.map((tab) => {
            const count = tab.id === 'TODOS' ? orders.length : orders.filter(o => o.estado_pedido === tab.id).length;
            const active = filterState === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterState(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active ? 'bg-accent text-ink shadow-sm font-semibold' : 'text-cream/70 hover:text-cream hover:bg-surface/40'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-ink/20 text-ink' : 'bg-ink/40 text-cream/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por ref o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg bg-ink/70 border border-accent/25 text-cream placeholder:text-cream/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="h-9 px-2 text-xs rounded-lg bg-ink/70 border border-accent/25 text-cream focus:outline-none focus:border-accent"
          >
            <option value="TODOS">Origen: Todos</option>
            <option value="WEB">Web</option>
            <option value="POS">POS</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-accent/15 bg-surface/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-cream/90">
            <thead className="border-b border-accent/10 bg-ink/40 text-xs uppercase tracking-wider text-cream/50">
              <tr>
                <th className="px-5 py-3.5 font-medium">Referencia</th>
                <th className="px-4 py-3.5 font-medium">Cliente</th>
                <th className="px-4 py-3.5 font-medium">Fecha</th>
                <th className="px-4 py-3.5 font-medium">Origen</th>
                <th className="px-4 py-3.5 font-medium">Estado Pedido</th>
                <th className="px-4 py-3.5 font-medium">Estado Pago</th>
                <th className="px-5 py-3.5 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-accent animate-pulse">Cargando pedidos...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-cream/40">No hay pedidos que coincidan con los filtros.</td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="cursor-pointer transition-colors hover:bg-surface/40 group"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-accent group-hover:underline">{o.referencia}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-cream">{o.cliente_nombre}</p>
                      <p className="text-xs text-cream/50 line-clamp-1">
                        {o.items.map(i => `${i.nombre_snapshot} ×${i.cantidad}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-cream/60">{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono ${o.origen === 'WEB' ? 'bg-surface/40 text-cream/80' : 'bg-accent/15 text-accent'}`}>
                        {o.origen}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={o.estado_pedido === 'ENTREGADO' ? 'success' : o.estado_pedido === 'LISTO' ? 'info' : 'warning'}>
                        {o.estado_pedido}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={o.estado_pago === 'PAGADO' ? 'success' : o.estado_pago === 'ANTICIPO_PARCIAL' ? 'warning' : 'danger'}>
                        {o.estado_pago}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-medium text-cream">{formatCOP(o.total_final)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateState={handleUpdateState}
      />
    </div>
  );
};