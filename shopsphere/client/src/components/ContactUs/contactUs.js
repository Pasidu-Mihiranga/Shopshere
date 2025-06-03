import React from "react";
import "./contactUs.css";


const ContactInfo = () => {
  return (
    <>
   
      <section className="contact-section">
        <h1>Contact Us</h1>

        <div className="contact-details">
          <h2>Our Office</h2>
          <p>
            <strong>Hirelio</strong>
            <br />
            15a,Fourth Lane,Katubedda
          </p>
        </div>

        <div className="contact-details">
          <h2>Get in Touch</h2>
          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+94760554321">(+94) 760 554 321</a>
          </p>
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a href="tel:+94760554322">(+94) 760 554 322</a>
          </p>
        </div>

        <div className="contact-details">
          <h2>Email Support</h2>
          <p>
            <strong>General Inquiries:</strong>{" "}
            <a href="mailto:info@hirelio.com">info@hirelio.com</a>
          </p>
          <p>
            <strong>Employer Support:</strong>{" "}
            <a href="mailto:employers@hirelio.com">employers@hirelio.com</a>
          </p>
          <p>
            <strong>Job Seeker Support:</strong>{" "}
            <a href="mailto:support@hirelio.com">support@hirelio.com</a>
          </p>
        </div>

        <div className="contact-form">
          <h2>Contact Form</h2>
          <form action="submit_form.php" method="POST">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="subject">Subject:</label>
            <input type="text" id="subject" name="subject" required />

            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" rows="4" required></textarea>
            <div className="bu">
              <button type="submit">Send Message</button>
            </div>
          </form>
        </div>
      </section>
      
    </>
  );
};

export default ContactInfo;
