import { EmptyState } from "@/components/ui";
export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <main className="shell page"><EmptyState title="Detalle de oferta">La oferta {id} se conectará al catálogo público en la siguiente fase.</EmptyState></main>; }
