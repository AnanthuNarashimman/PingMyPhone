import { useState } from "react";
import "../Styles/PageStyles/ContactPage.css";
import Navbar from "../Components/Navbar";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "review", // default type
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recipient = "ananthun420@gmail.com";
    const subject = `${formData.type === "complaint" ? "Complaint" : "Review"} - ${formData.subject}`;
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: "review",
    });
  };

  return (
    <>

    <div className="body"></div>
      <Navbar />

      <div className="contact-page">
        <h1>Contact Us</h1>
        <p>Send us your feedback, reviews, or raise a concern. We value every message.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Subject:
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Message Type:
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="review">Review / Suggestion</option>
              <option value="complaint">Complaint</option>
            </select>
          </label>

          <label>
            Your Message:
            <textarea
              name="message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Send Message</button>
        </form>
      </div>
    </>
  );
}

export default ContactPage;
