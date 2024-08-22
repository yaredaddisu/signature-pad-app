import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import { useLocation } from 'react-router-dom';

import './App.css';

const SignaturePadComponent = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const chat_id = query.get('chat_id');
    const email = query.get('email');
    const firstName = query.get('firstName');
    const lastName = query.get('lastName');
    const phone = query.get('phone');

    // Decode URL parameters
    const [formData, setFormData] = useState({
        firstName: decodeURIComponent(firstName) || '',
        lastName: decodeURIComponent(lastName) || '',
        phone: decodeURIComponent(phone) || '',
        email: decodeURIComponent(email) || '',
    });
    const [signature, setSignature] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const signatureCanvasRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSignature = () => {
        const sigDataURL = signatureCanvasRef.current.toDataURL();
        setSignature(sigDataURL);
    };

    const generatePDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(12);
        doc.text(`First Name: ${formData.firstName}`, 10, 10);
        doc.text(`Last Name: ${formData.lastName}`, 10, 20);
        doc.text(`Phone: ${formData.phone}`, 10, 30);
        doc.text(`Email: ${formData.email}`, 10, 40);
    // Add signature label and image
doc.text('Signature:', 10, 50);
if (signature) {
    doc.addImage(signature, 'PNG', 10, 55, 190, 30); // Adjust position and size as needed
}

        return doc.output('blob');
    };

    const sendToTelegram = async (pdfBlob) => {
        const formData = new FormData();
        formData.append('chat_id', chat_id); // Use chat_id from query params
        formData.append('document', pdfBlob, 'registration_form.pdf');

        const token = '7050516624:AAFv4A-VUxLiWONdRd0iZWbqrkGoqG-6hC4'; // Your bot token

        try {
            const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.ok) {
                alert('PDF sent successfully!');
                setFormData({ data: " " });
            } else {
                alert(`Failed to send PDF: ${result.description}`);
            }
        } catch (error) {
            console.error('Error sending PDF:', error);
            alert('Error sending PDF. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!chat_id) {
            alert('Chat ID is missing.');
            return;
        }
        setIsSubmitting(true);

        try {
            const pdfBlob = generatePDF();
            await sendToTelegram(pdfBlob);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <h1>Registration Form</h1>
            <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone:</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Signature:</label>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                        onEnd={handleSignature}
                        ref={signatureCanvasRef}
                    />
                    <button type="button" onClick={() => signatureCanvasRef.current.clear()}>Clear Signature</button>
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default SignaturePadComponent;
