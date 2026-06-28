/**
 * Dr. Karpe's Dental Clinic — Interactive FAQ Chatbot Widget (Revised UI)
 * Dynamically injected on all pages
 */

(function () {
  // FAQ Database
  const faqData = {
    welcome: {
      text: "Hello! Welcome to Dr. Karpe's Centre for Advanced Dentistry. 🦷<br><br>I am your digital support assistant. How can I help you today? Please click one of the options below:",
      options: [
        { text: "⏰ Clinic Hours & Locations", nextKey: "hours_locations" },
        { text: "📅 Book an Appointment", nextKey: "booking" },
        { text: "🦷 Dental Treatments", nextKey: "treatments" },
        { text: "🚨 Dental Emergency Advice", nextKey: "emergency" },
        { text: "💬 Chat on WhatsApp", action: "whatsapp" }
      ]
    },
    hours_locations: {
      text: "We have two branches equipped with state-of-the-art dental diagnostics:<br><br>📍 <strong>Solapur Branch (Main):</strong><br>139, Vijay Tower, Near Bombay Bakery, Railway Line, Solapur.<br>🕒 Mon-Sat: 10:00 AM - 1:30 PM & 5:00 PM - 9:00 PM (Sunday Closed).<br><br>📍 <strong>Akkalkot Branch:</strong><br>35, Shiv Chatrapati Vyapari Sankul, Kanda Bazaar, Akkalkot.<br>🕒 Mon-Sat: 10:00 AM - 2:00 PM & 5:00 PM - 8:00 PM.",
      options: [
        { text: "📅 Book Appointment", nextKey: "booking" },
        { text: "🦷 Check Treatments", nextKey: "treatments" },
        { text: "↩️ Back to Main Menu", nextKey: "welcome" }
      ]
    },
    booking: {
      text: "You can schedule your consultation session in two easy ways:<br><br>1. 📝 Fill out our online booking form on the website.<br>2. 📞 Call/WhatsApp our reception desk directly.<br><br>Which option would you prefer?",
      options: [
        { text: "💻 Open Booking Form", action: "link", url: "contact.html#book" },
        { text: "💬 Chat on WhatsApp", action: "whatsapp" },
        { text: "↩️ Back to Main Menu", nextKey: "welcome" }
      ]
    },
    treatments: {
      text: "Dr. Karpe's clinic provides advanced procedures in a comfortable, hygienic environment:<br><br>• <strong>Dental Implants:</strong> Life-like full-arch replacements.<br>• <strong>Smile Designing:</strong> Natural cosmetic veneers and laminates.<br>• <strong>Root Canal:</strong> Painless single-visit root canals.<br>• <strong>Orthodontics:</strong> Invisible aligners and braces.<br>• <strong>Pediatric Care:</strong> Gentle child dentistry.<br><br>Would you like to read more on our treatments page?",
      options: [
        { text: "📖 View Treatments Page", action: "link", url: "treatments.html" },
        { text: "📅 Book Consultation", nextKey: "booking" },
        { text: "↩️ Back to Main Menu", nextKey: "welcome" }
      ]
    },
    emergency: {
      text: "⚠️ <strong>Dental Emergency Advice:</strong><br><br>• <strong>Severe Toothache:</strong> Rinse with warm water and take an over-the-counter painkiller. Avoid placing aspirin directly on the gums.<br>• <strong>Knocked-Out Tooth:</strong> Keep it moist in milk or saliva and contact us immediately. If seen within 1 hour, we can often save the tooth!<br>• <strong>Bleeding or Swelling:</strong> Apply clean cold compress and seek emergency care.<br><br>📞 Call us immediately: Solapur <strong>+91 94055-49094</strong> or Akkalkot <strong>+91 95031-59509</strong>.",
      options: [
        { text: "📞 Call Solapur Clinic", action: "call", phone: "+919405549094" },
        { text: "💬 Chat on WhatsApp", action: "whatsapp" },
        { text: "↩️ Back to Main Menu", nextKey: "welcome" }
      ]
    },
    fallback: {
      text: "I'm still learning! 🧠<br><br>You can click one of the quick options below, or chat directly with our clinic representative on WhatsApp for personal assistance.",
      options: [
        { text: "💬 Chat on WhatsApp", action: "whatsapp" },
        { text: "↩️ Back to Main Menu", nextKey: "welcome" }
      ]
    }
  };

  // WhatsApp configuration
  const whatsappPhone = "+918767223224"; // Tested phone number
  const whatsappBaseUrl = "https://wa.me/" + whatsappPhone + "?text=";

  document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject HTML Elements
    const chatbotContainer = document.createElement("div");
    chatbotContainer.id = "dr-karpe-chatbot-root";
    chatbotContainer.innerHTML = `
      <!-- Floating Toggle Bubble (Uses Just_logo.png) -->
      <button class="chatbot-toggle" aria-label="Open support chat" title="Patient Support">
        <img src="assets/img/Just_logo.png" alt="Dr. Karpe's Clinic Logo" />
      </button>

      <!-- Chatbot Window (Headerless, Spacious) -->
      <div class="chatbot-window" aria-hidden="true">
        <!-- Slim Close Bar overlayed on top of messages -->
        <div class="chatbot-header-slim">
          <button class="chatbot-close" aria-label="Close support chat">&times;</button>
        </div>

        <!-- Messages stream -->
        <div class="chatbot-messages"></div>

        <!-- Text input field -->
        <form class="chatbot-input-area" autocomplete="off">
          <input type="text" placeholder="Ask a question..." aria-label="Chat input field" />
          <button type="submit" class="chatbot-send" aria-label="Send message">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(chatbotContainer);

    // 2. Selectors
    const toggleBtn = chatbotContainer.querySelector(".chatbot-toggle");
    const chatWindow = chatbotContainer.querySelector(".chatbot-window");
    const closeBtn = chatbotContainer.querySelector(".chatbot-close");
    const messagesContainer = chatbotContainer.querySelector(".chatbot-messages");
    const inputForm = chatbotContainer.querySelector(".chatbot-input-area");
    const textInput = chatbotContainer.querySelector("input");

    let isInitialized = false;

    // 3. Open/Close Logic
    toggleBtn.addEventListener("click", () => {
      const isActive = chatWindow.classList.toggle("active");
      chatWindow.setAttribute("aria-hidden", !isActive);
      
      if (isActive && !isInitialized) {
        initializeChat();
      }
    });

    closeBtn.addEventListener("click", () => {
      chatWindow.classList.remove("active");
      chatWindow.setAttribute("aria-hidden", "true");
    });

    // 4. Conversation engine
    function initializeChat() {
      isInitialized = true;
      showBotMessage(faqData.welcome.text, faqData.welcome.options);
    }

    function appendMessage(sender, text, isHtml = false) {
      const bubble = document.createElement("div");
      bubble.className = `cb-msg ${sender}`;
      
      if (isHtml) {
        bubble.innerHTML = text;
      } else {
        bubble.textContent = text;
      }
      
      messagesContainer.appendChild(bubble);
      
      if (sender === "user") {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        // Smoothly scroll to the top of the bot's bubble (clearing the floating close button)
        messagesContainer.scrollTo({
          top: bubble.offsetTop - 60,
          behavior: "smooth"
        });
      }
    }

    function showTypingIndicator() {
      const indicator = document.createElement("div");
      indicator.className = "cb-msg bot cb-typing-indicator-wrapper";
      indicator.innerHTML = `
        <div class="cb-typing">
          <span class="cb-typing-dot"></span>
          <span class="cb-typing-dot"></span>
          <span class="cb-typing-dot"></span>
        </div>
      `;
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      return indicator;
    }

    function removeTypingIndicator(indicatorElement) {
      if (indicatorElement && indicatorElement.parentNode) {
        indicatorElement.parentNode.removeChild(indicatorElement);
      }
    }

    function showBotMessage(text, options = []) {
      const indicator = showTypingIndicator();

      // Simulate typing delay
      setTimeout(() => {
        removeTypingIndicator(indicator);
        appendMessage("bot", text, true);
        renderOptions(options);
      }, 700);
    }

    function renderOptions(options) {
      if (!options || options.length === 0) return;

      const group = document.createElement("div");
      group.className = "cb-options-group";

      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "cb-inline-option";
        btn.textContent = opt.text;
        
        btn.addEventListener("click", () => {
          // Remove this entire inline options group from the chat history immediately
          group.parentNode.removeChild(group);
          
          // Append the user's clicked choice as a standard teal User bubble
          appendMessage("user", opt.text);

          // Route actions
          if (opt.action === "whatsapp") {
            setTimeout(() => {
              window.open(whatsappBaseUrl + encodeURIComponent("Hi Dr. Karpe, I have a question regarding: " + opt.text), "_blank");
              showBotMessage("Opening WhatsApp to chat with our front desk... Let me know if you need anything else!", [
                { text: "↩️ Back to Main Menu", nextKey: "welcome" }
              ]);
            }, 500);
          } else if (opt.action === "link") {
            setTimeout(() => {
              window.location.href = opt.url;
            }, 300);
          } else if (opt.action === "call") {
            window.location.href = "tel:" + opt.phone;
          } else if (opt.nextKey) {
            const nextNode = faqData[opt.nextKey];
            if (nextNode) {
              showBotMessage(nextNode.text, nextNode.options);
            }
          }
        });

        group.appendChild(btn);
      });

      messagesContainer.appendChild(group);
    }

    // 5. Keyword search parsing for text inputs
    inputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawText = textInput.value.trim();
      if (!rawText) return;

      // Add user speech bubble
      appendMessage("user", rawText);
      textInput.value = ""; // Clear input field

      const query = rawText.toLowerCase();

      // Parse keywords
      if (query.includes("hour") || query.includes("time") || query.includes("open") || query.includes("close") || query.includes("sunday")) {
        showBotMessage(faqData.hours_locations.text, faqData.hours_locations.options);
      } else if (query.includes("where") || query.includes("address") || query.includes("location") || query.includes("branch") || query.includes("solapur") || query.includes("akkalkot") || query.includes("map")) {
        showBotMessage(faqData.hours_locations.text, faqData.hours_locations.options);
      } else if (query.includes("book") || query.includes("appointment") || query.includes("consult") || query.includes("visit") || query.includes("schedule") || query.includes("doctor")) {
        showBotMessage(faqData.booking.text, faqData.booking.options);
      } else if (query.includes("treatment") || query.includes("service") || query.includes("implant") || query.includes("rct") || query.includes("braces") || query.includes("veneer") || query.includes("clean") || query.includes("fill")) {
        showBotMessage(faqData.treatments.text, faqData.treatments.options);
      } else if (query.includes("emergency") || query.includes("pain") || query.includes("bleed") || query.includes("broke") || query.includes("hurt")) {
        showBotMessage(faqData.emergency.text, faqData.emergency.options);
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("support")) {
        showBotMessage(faqData.welcome.text, faqData.welcome.options);
      } else {
        // Fallback response for unmatched text inputs
        showBotMessage(faqData.fallback.text, faqData.fallback.options);
      }
    });
  });
})();
