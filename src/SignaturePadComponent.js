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
    const CompanyName = query.get('CompanyName');

    const [formData, setFormData] = useState({
        firstName: decodeURIComponent(firstName) || '',
        lastName: decodeURIComponent(lastName) || '',
        phone: decodeURIComponent(phone) || '',
        email: decodeURIComponent(email) || '',
        clientName: decodeURIComponent(CompanyName) || ' ',
        devicePurpose: '',
        branch: '',
        workAssessmentNo: '',
        location: '',
        startTime: '',
        endTime: '',
        deviceType: '',
        problemDescription: '',
        previousStory: '',
        materialList: [],
        technicalDescription: '',
        contactPerson: '',
        telephone: '',
        position: '',
        tinNo: '',
        AssessedBy:'',
        ApprovedBy:'',
        AssessedDate:'',
        ApprovedDate:'',
    });
    const [signature1, setSignature1] = useState(null);

    const [signature2, setSignature2] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const signatureCanvasRef = useRef(null);
    const signatureCanvasRef2 = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleMaterialChange = (index, field, value) => {
        const newMaterials = [...formData.materialList];
        newMaterials[index] = { ...newMaterials[index], [field]: value };
        setFormData({
            ...formData,
            materialList: newMaterials,
        });
    };

    const handleRemoveMaterial = (index) => {
        const newMaterials = formData.materialList.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            materialList: newMaterials,
        });
    };
    const handleSignature1 = () => {
        const sigDataURL = signatureCanvasRef.current.toDataURL();
        setSignature1(sigDataURL);
    };
    const handleSignature2 = () => {
        const sigDataURL = signatureCanvasRef2.current.toDataURL();
        setSignature2(sigDataURL);
    };
    const generatePDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const margin = 10;
        const lineHeight = 6; // Reduced line height
        let currentY = margin;
    
        const addPageIfNeeded = (height) => {
            const pageHeight = doc.internal.pageSize.height;
            if (currentY + height > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
            }
        };
    
        // Company and Form Title
        doc.setFontSize(14);
        doc.text('MTS TRADING PLC', 105, currentY + 4, { align: 'center' });
        doc.text('HVAC Services', 105, currentY + 10, { align: 'center' });
        currentY += 20;
    
        doc.setFontSize(8);
        doc.text('Job Assessment Report Form / Site Visit', 105, currentY, { align: 'center' });
        doc.text('No', 180, currentY);
        currentY += 3;
    
        // General Information Section
        doc.setFontSize(10);
        doc.text('General Information', margin, currentY);
        doc.line(margin, currentY + 1, 200 - margin, currentY + 1);
        currentY += 8;
        const generalInfoData = [
            { label: 'Client Name', value: formData.clientName },
            { label: 'Device Purpose', value: formData.devicePurpose },
            { label: 'Branch', value: formData.branch },
            { label: 'Work Assessment No', value: formData.workAssessmentNo },
            { label: 'Location', value: formData.location },
            { label: 'Start Time', value: formData.startTime },
            { label: 'End Time', value: formData.endTime },
            { label: 'Device Type', value: formData.deviceType },
        ];
        
        const splitIndex = Math.ceil(generalInfoData.length / 2);
        const leftColumn = generalInfoData.slice(0, splitIndex);
        const rightColumn = generalInfoData.slice(splitIndex);
        
        leftColumn.forEach((item, index) => {
            addPageIfNeeded(8);
        
            // Print left column text
            doc.text(`${item.label}:`, margin, currentY);
            doc.text(item.value || '', margin + 50, currentY);
        
            // Print corresponding right column text
            if (rightColumn[index]) {
                doc.text(`${rightColumn[index].label}:`, margin + 100, currentY);
                doc.text(rightColumn[index].value || '', margin + 150, currentY);
            }
        
            // Update currentY after both columns are printed
            currentY += lineHeight;
        });
        
        addPageIfNeeded(20);
        
        // HVAC-R Services Section
        doc.setFontSize(12);
        doc.text('HVAC-R SERVICES', margin, currentY + 4);
        currentY += 8;
    
        doc.setFontSize(10);
        doc.text('Nature of Problem (Problem Description):', margin, currentY);
        currentY += 8;
        doc.rect(margin, currentY, 190 - 2 * margin, 20); // Reduced height
        doc.text(doc.splitTextToSize(formData.problemDescription || '', 190 - 2 * margin), margin + 2, currentY + 5);
        currentY += 24;
    
        addPageIfNeeded(20);
    
        // Previous Story Section
        doc.text('Previous Story', margin, currentY);
        currentY += 8;
        doc.rect(margin, currentY, 190 - 2 * margin, 15); // Reduced height
        doc.text(doc.splitTextToSize(formData.previousStory || '', 190 - 2 * margin), margin + 2, currentY + 4);
        currentY += 20;
    
        addPageIfNeeded(20);
    
        // Required Materials and Spare Parts Section
        doc.text('Required Materials and Spare Parts', margin, currentY);
        doc.line(margin, currentY + 1, 200 - margin, currentY + 1);
        currentY += 8;
    
        const tableHeaders = ['S.NO', 'Material List', 'Specification', 'Qty', 'Stock Avail.', 'Remark'];
        tableHeaders.forEach((header, i) => {
            doc.text(header, margin + i * 30, currentY);
        });
        currentY += lineHeight;
    
        formData.materialList.forEach((item, index) => {
            addPageIfNeeded(8);
            doc.text(`${index + 1}`, margin, currentY);
            doc.text(item.name || '', margin + 30, currentY);
            doc.text(item.specification || '', margin + 60, currentY);
            doc.text(item.qty || '', margin + 110, currentY);
            doc.text(item.stockAvailable ? 'Yes' : 'No', margin + 140, currentY);
            doc.text(item.remark || '', margin + 170, currentY);
            currentY += lineHeight;
        });
    
        addPageIfNeeded(20);
    
        // Technical Description Section
        doc.text('Technical Description of the work', margin, currentY+3);
        currentY += 8;
        doc.rect(margin, currentY, 190 - 2 * margin, 15); // Reduced height
        doc.text(doc.splitTextToSize(formData.technicalDescription || '', 190 - 2 * margin), margin + 2, currentY + 4);
        currentY += 20;
    
        addPageIfNeeded(20);
    
        // Client Information Section
        doc.text('Client Information', margin, currentY);
        doc.line(margin, currentY + 1, 200 - margin, currentY + 1);
        currentY += 8;
        const clientInfoData = [
            { label: 'Contact Person', value: formData.contactPerson, x: margin },
            { label: 'Telephone', value: formData.telephone, x: margin + 100 },
            { label: 'Position', value: formData.position, x: margin },
            { label: 'TIN No', value: formData.tinNo, x: margin + 100 },
            { label: 'Assessed by', value: formData.AssessedBy, x: margin  },
            { label: 'Approved by', value: formData.ApprovedBy, x: margin + 100 },
            { label: 'Date', value: formData.AssessedDate, x: margin  },
            { label: 'Date', value: formData.ApprovedDate, x: margin + 100 },
        ];
        
        // Render the client information
        clientInfoData.forEach((item, index) => {
            const y = currentY + Math.floor(index / 2) * 10; // Increased line spacing to prevent overlap
            doc.text(`${item.label}:`, item.x, y);
            doc.text(item.value || '', item.x + 50, y);
        });
        
        // Move down sufficiently before adding signatures
        currentY += 50;  // Adjust this value as needed to ensure there's enough space
        
        // Signatures
        doc.text('Signature', margin, currentY);
        if (signature1) {
            doc.addImage(signature1, 'PNG', margin + 15, currentY - 6, 40, 10);
        }
        
        doc.text('Signature', margin + 100, currentY);
        if (signature2) {
            doc.addImage(signature2, 'PNG', margin + 115, currentY - 6, 40, 10);
        }
        
        currentY += 20;
    
        addPageIfNeeded(15);
    
        // Footer Information
        doc.setFontSize(12);
        currentY += 1;
        const currentDate = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString(undefined, options);
     
        doc.text(`Generated Date: ${formattedDate}`, margin, currentY);
    
        // Return the generated PDF as a blob
        return doc.output('blob');
    };
    
    
    const sendToTelegram = async (pdfBlob) => {
        const formData = new FormData();
        formData.append('chat_id', chat_id); // Use chat_id from query params
        formData.append('document', pdfBlob, 'HVAC-R_Services_Form.pdf');

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
            <h1>HVAC-R Services Form</h1>
            <form onSubmit={handleSubmit} className="hvac-form">

            <div  >
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
              
             
            </div>
                <div className="form-group">
                    <label>Client Name:</label>
                    <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Device Purpose:</label>
                    <input
                        type="text"
                        name="devicePurpose"
                        value={formData.devicePurpose}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Branch:</label>
                    <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Work Assessment No:</label>
                    <input
                        type="text"
                        name="workAssessmentNo"
                        value={formData.workAssessmentNo}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Start Time:</label>
                    <input
                        type="text"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>End Time:</label>
                    <input
                        type="text"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Device Type:</label>
                    <input
                        type="text"
                        name="deviceType"
                        value={formData.deviceType}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Problem Description:</label>
                    <textarea
                        name="problemDescription"
                        value={formData.problemDescription}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Previous Story:</label>
                    <textarea
                        name="previousStory"
                        value={formData.previousStory}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Required Materials:</label>
                    {formData.materialList.map((material, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                placeholder="Material Name"
                                value={material.name}
                                onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Specification"
                                value={material.specification}
                                onChange={(e) => handleMaterialChange(index, 'specification', e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Qty"
                                value={material.qty}
                                onChange={(e) => handleMaterialChange(index, 'qty', e.target.value)}
                                required
                            />
                            <input
                                type="checkbox"
                                checked={material.stockAvailable}
                                onChange={(e) => handleMaterialChange(index, 'stockAvailable', e.target.checked)}
                            /> Stock Available
                            <input
                                type="text"
                                placeholder="Remark"
                                value={material.remark}
                                onChange={(e) => handleMaterialChange(index, 'remark', e.target.value)}
                            />
                     <button type="button" onClick={() => handleRemoveMaterial(index)}>X</button>

                        </div>
                    ))}
                    <button type="button" onClick={() => setFormData({ ...formData, materialList: [...formData.materialList, {}] })}>
                        Add Material
                    </button>
                </div>
                <div className="form-group">
                    <label>Technical Description:</label>
                    <textarea
                        name="technicalDescription"
                        value={formData.technicalDescription}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Contact Person:</label>
                    <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Telephone:</label>
                    <input
                        type="text"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Position:</label>
                    <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>TIN No:</label>
                    <input
                        type="text"
                        name="tinNo"
                        value={formData.tinNo}
                        onChange={handleChange}
                        required
                    />
                </div>
      <div className="form-group">
                    <label> AssessedBy:</label>
                    <input
                        type="text"
                        name="AssessedBy"
                        value={formData.AssessedBy}
                        onChange={handleChange}
                        required
                    />
                </div>
     <div className="form-group">
                    <label> Date:</label>
                    <input
                        type="date"
                        name="AssessedDate"
                        value={formData.AssessedDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Signature:</label>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ width: 500, height: 100, className: 'sigCanvas' }}
                        onEnd={handleSignature1}
                        ref={signatureCanvasRef}
                    />
                    <button type="button" onClick={() => signatureCanvasRef.current.clear()}>Clear Signature</button>
                </div>
      <div className="form-group">
                    <label> ApprovedBy:</label>
                    <input
                        type="text"
                        name="ApprovedBy"
                        value={formData.ApprovedBy}
                        onChange={handleChange}
                        required
                    />
                </div>
  <div className="form-group">
                    <label> Date:</label>
                    <input
                        type="date"
                        name="ApprovedDate"
                        value={formData.ApprovedDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Signature:</label>
                    <SignatureCanvas
                        penColor="black"
                        canvasProps={{ width: 500, height: 100, className: 'sigCanvas' }}
                        onEnd={handleSignature2}
                        ref={signatureCanvasRef2}
                    />
                    <button type="button" onClick={() => signatureCanvasRef2.current.clear()}>Clear Signature</button>
                </div>
                <div className="form-group">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignaturePadComponent;
