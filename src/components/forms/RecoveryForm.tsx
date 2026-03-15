import { useEffect, useState } from "react";
import { Button } from "../Button";

import { recoveryService } from "../../services/RecoveryService";

import type { Recovery } from "../../types/recovery";
import type { Operations } from "../../types/operations";

import "../../styles/form.css";

interface Props {

    initialData?: Recovery;

    onSubmit: (data: Partial<Recovery>) => Promise<void>;

    onCancel: () => void;
}

export default function RecoveryForm({ initialData, onSubmit, onCancel }: Props) {

    const [operations, setOperations] = useState<Operations[]>([]);

    const [operationId, setOperationId] = useState(initialData?.operation_id ?? "");
    const [amount, setAmount] = useState(initialData?.amount ?? 0);
    const [paymentDate, setPaymentDate] = useState(
        initialData?.payment_date ?? new Date().toISOString().substring(0, 10)
    );

    useEffect(() => {

        async function load() {

            const ops = await recoveryService.getEligibleOperations();

            setOperations(ops);

        }

        load();

    }, []);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        const op = operations.find(o => o.id === operationId);

        await onSubmit({
            operation_id: operationId,
            client_id: op?.client_id,
            amount,
            payment_date: paymentDate
        });

    };

    return (

        <form onSubmit={handleSubmit} className="app-form">

            <div className="form-grid">
                {/* Operation */}

                <div className="form-field">

                    <label>Opération</label>
                    <select
                        value={operationId}
                        onChange={e => setOperationId(e.target.value)}
                        required
                    >

                        <option value="">Choisir une opération</option>

                        {operations.map(o => (

                            <option key={o.id} value={o.id}>

                                {o.receipt_reference} — Restant : {o.remaining_amount}

                            </option>

                        ))}

                    </select>
                </div>

                {/* Montant */}

                <div className="form-field">

                    <label>Montant</label>
                    <input
                        type="number"
                        placeholder="Montant"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                        required
                    />
                </div>
                {/* Date */}

                <div className="form-field">

                    <label>Date</label>
                    <input
                        type="date"
                        value={paymentDate}
                        onChange={e => setPaymentDate(e.target.value)}
                    />
                </div>
                {/* Actions */}

                <div className="form-actions">

                    <Button
                        label="Annuler"
                        variant="secondary"
                        onClick={onCancel}
                    />

                    <Button
                        label="Enregistrer"
                        variant="info"
                        type="submit"
                    />

                </div>
            </div>

        </form>
    );
}