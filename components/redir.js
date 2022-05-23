import { useState, useEffect, useRef } from "react";
import { getSignedPayment } from "../controllers/redsys";
import { useRouter } from "next/router";

export default function Redir() {
    const [codedPayment, setCodedPayment] = useState(null);
    const router = useRouter();
    const formRef = useRef(null);

    useEffect(() => {
        if (!router.query.concept) return;
        const getCode = () => {
            const now = new Date();
            const concept = router.query.concept || "GVVG";
            return (now.getMonth() + 1).toString().padStart(2, 0).concat(now.getDate().toString().padStart(2, 0), now.getHours(), now.getMinutes(), concept.substring(0, 4));
        }
        const cPayment = router.query.amount && getSignedPayment(Number(router.query.amount), "https://gorkavillar.com", "https://gorkavillar.com", "https://gorkavillar.com", getCode(), router.query.bizum ? true : false);
        return setCodedPayment(cPayment);
    }, [router.query]);

    useEffect(() => {
        setTimeout(() => formRef.current && formRef.current.submit(), 2000)
    }, [formRef])

    return (codedPayment ? <>
        <form action="https://sis.redsys.es/sis/realizarPago" method="post" ref={formRef}>
            <input type="hidden" name="Ds_SignatureVersion" value={codedPayment.Ds_SignatureVersion} />
            <input type="hidden" name="Ds_MerchantParameters" value={codedPayment.Ds_MerchantParameters} />
            <input type="hidden" name="Ds_Signature" value={codedPayment.Ds_Signature} />
        </form>
    </> : null
    )
}
