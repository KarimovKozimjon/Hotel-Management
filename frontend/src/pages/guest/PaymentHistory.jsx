
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useGuestAuth } from '../../context/GuestAuthContext';
import toast from 'react-hot-toast';

export default function PaymentHistory() {
	const { guest } = useGuestAuth();
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPayments = async () => {
			try {
				const res = await api.get('/guest/payments');
				setPayments(res.data.data || []);
			} catch (e) {
				toast.error("To'lovlar tarixini yuklashda xatolik");
			} finally {
				setLoading(false);
			}
		};
		fetchPayments();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-2 sm:px-0">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold text-center text-purple-700 mb-8 drop-shadow">To'lovlar tarixi</h1>
				{loading ? (
					<div className="flex justify-center items-center h-40">
						<div className="animate-pulse w-16 h-16 rounded-full bg-gradient-to-r from-purple-300 to-blue-300 opacity-60"></div>
					</div>
				) : payments.length === 0 ? (
					<div className="bg-white rounded-xl shadow p-8 text-center text-blue-500 text-lg font-semibold">
						Hech qanday to'lov topilmadi.
					</div>
				) : (
					<div className="grid gap-6">
						{payments.map((payment) => (
							<div
								key={payment.id}
								className="relative bg-white rounded-2xl shadow-xl p-6 border-2 border-transparent hover:border-purple-400 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
								style={{
									background: 'linear-gradient(120deg, #f3e8ff 0%, #e0e7ff 100%)',
								}}
							>
								<div className="flex justify-between items-center mb-2">
									<div className="text-lg font-bold text-purple-700 flex items-center gap-2">
										<span className="inline-block bg-purple-100 rounded-full p-2">
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
										</span>
										{payment.booking?.room?.roomType?.name || 'Xona'}
									</div>
									<span className="text-base font-semibold text-green-600">${payment.amount}</span>
								</div>
								<div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
									<div>
										<span className="font-semibold">To'lov turi:</span> {payment.payment_method === 'cash' ? 'Naqd' : payment.payment_method === 'card' ? 'Karta' : payment.payment_method}
									</div>
									<div>
										<span className="font-semibold">Holat:</span> <span className={payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>{payment.status === 'completed' ? "To'langan" : payment.status}</span>
									</div>
									<div>
										<span className="font-semibold">Sana:</span> {new Date(payment.paid_at).toLocaleDateString('uz-UZ')}
									</div>
								</div>
								<div className="text-xs text-gray-500">Bron raqami: #{payment.booking?.id}</div>
								<div className="absolute right-4 top-4 opacity-10 text-7xl pointer-events-none select-none group-hover:opacity-20 transition-all duration-300">💸</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

