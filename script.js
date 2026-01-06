// Handle sticky header, mobile nav, testimonial slider, and gallery tabs

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const body = document.body;

  // Dynamic year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Sticky header behavior
  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  // Mobile menu toggle
  const toggleNav = () => {
    const isOpen = mobileNav.classList.toggle("open");
    body.style.overflow = isOpen ? "hidden" : "";
    navToggle.classList.toggle("open", isOpen);

    const spans = navToggle.querySelectorAll("span");
    if (isOpen) {
      spans[0].style.transform = "translateY(5px) rotate(45deg)";
      spans[1].style.transform = "translateY(-5px) rotate(-45deg)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.transform = "";
    }
  };

  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
  }

  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileNav.classList.contains("open")) toggleNav();
      });
    });
  }

  // Testimonials slider
  const testimonials = Array.from(document.querySelectorAll(".testimonial"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  const prevBtn = document.querySelector(".slider-arrow.prev");
  const nextBtn = document.querySelector(".slider-arrow.next");

  let currentIndex = 0;
  let sliderInterval;

  const setActiveSlide = (index) => {
    if (!testimonials.length) return;
    currentIndex = (index + testimonials.length) % testimonials.length;

    testimonials.forEach((t, i) => {
      t.classList.toggle("active", i === currentIndex);
    });
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === currentIndex);
    });
  };

  const nextSlide = () => setActiveSlide(currentIndex + 1);
  const prevSlide = () => setActiveSlide(currentIndex - 1);

  const startAutoSlide = () => {
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 7000);
  };

  const restartAutoSlide = () => {
    startAutoSlide();
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      restartAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      restartAutoSlide();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index || "0");
      setActiveSlide(idx);
      restartAutoSlide();
    });
  });

  setActiveSlide(0);
  startAutoSlide();

  // Gallery filter tabs
  const tabButtons = Array.from(document.querySelectorAll(".gallery-tab"));
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      galleryItems.forEach((item) => {
        const itemCats = (item.dataset.category || "").split(" ");
        const show = category === "all" || itemCats.includes(category);
        item.style.display = show ? "block" : "none";
      });
    });
  });

  // Simple non-functional form handler for demo
  // Supabase client for appointments
  const supabaseUrl = "https://lsugimcalldofgkpzhxo.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdWdpbWNhbGxkb2Zna3B6aHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTUzNTIsImV4cCI6MjA4MzI3MTM1Mn0.mL507WQ1q5MMbmBasiugAM2dGngmineN1hCpypA6t0g";
  const supabaseClient =
    typeof supabase !== "undefined"
      ? supabase.createClient(supabaseUrl, supabaseKey)
      : null;

  // Initialize Flatpickr for datetime picker
  const datetimeInput = document.getElementById("appointment_datetime");
  if (datetimeInput && typeof flatpickr !== "undefined") {
    flatpickr(datetimeInput, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      minDate: "today",
      minuteIncrement: 15,
      locale: {
        firstDayOfWeek: 1,
        weekdays: {
          shorthand: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
          longhand: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
        },
        months: {
          shorthand: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
          longhand: [
            "Tháng Một",
            "Tháng Hai",
            "Tháng Ba",
            "Tháng Tư",
            "Tháng Năm",
            "Tháng Sáu",
            "Tháng Bảy",
            "Tháng Tám",
            "Tháng Chín",
            "Tháng Mười",
            "Tháng Mười Một",
            "Tháng Mười Hai",
          ],
        },
      },
      // Style theo theme luxury
      theme: "dark",
    });
  }

  const contactForm = document.querySelector(".contact-form");
  const successModal = document.getElementById("successModal");
  const modalCloseBtns = document.querySelectorAll(".modal-close, .modal-close-btn");

  // Đóng modal
  modalCloseBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      successModal.classList.remove("show");
      document.body.style.overflow = "";
    });
  });

  // Đóng modal khi click outside
  if (successModal) {
    successModal.addEventListener("click", (e) => {
      if (e.target === successModal) {
        successModal.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  }

  // Đóng modal bằng ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && successModal && successModal.classList.contains("show")) {
      successModal.classList.remove("show");
      document.body.style.overflow = "";
    }
  });

  if (contactForm && supabaseClient) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitButton = contactForm.querySelector("button[type='submit']");
      const originalText = submitButton ? submitButton.textContent : "";

      const formData = new FormData(contactForm);
      const datetimeValue = formData.get("appointment_datetime");
      
      // Convert Flatpickr format (Y-m-d H:i) sang ISO string
      // Flatpickr trả về format: "2026-01-26 14:30" (local time)
      let appointmentDateTime = null;
      if (datetimeValue) {
        // Convert "YYYY-MM-DD HH:MM" thành ISO string
        const [datePart, timePart] = datetimeValue.split(" ");
        if (datePart && timePart) {
          appointmentDateTime = new Date(`${datePart}T${timePart}`).toISOString();
        }
      }

      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        service: formData.get("service") || null,
        message: formData.get("message") || null,
        appointment_time: appointmentDateTime,
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Odosielanie...";
      }

      try {
        // 1. Lưu vào Supabase database
        const { data, error } = await supabaseClient
          .from("appointments")
          .insert([payload])
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          alert("Chyba Supabase: " + error.message);
          return;
        }

        const row = data?.[0];

        // 2. Hiển thị modal NGAY LẬP TỨC sau khi lưu DB thành công
        document.getElementById("modal-name").textContent = payload.name || "-";
        document.getElementById("modal-phone").textContent = payload.phone || "-";
        document.getElementById("modal-email").textContent = payload.email || "-";
        document.getElementById("modal-service").textContent = payload.service || "Nešpecifikované";
        
        // Format času (slovenský čas)
        if (appointmentDateTime) {
          const date = new Date(appointmentDateTime);
          const formattedDate = date.toLocaleDateString("sk-SK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("sk-SK", {
            hour: "2-digit",
            minute: "2-digit",
          });
          document.getElementById("modal-time").textContent = `${formattedDate} o ${formattedTime}`;
        } else {
          document.getElementById("modal-time").textContent = "Nezadané";
        }
        
        document.getElementById("modal-message").textContent = payload.message || "Bez poznámky";

        // Hiển thị modal ngay lập tức
        successModal.classList.add("show");
        document.body.style.overflow = "hidden";

        // Reset form
        contactForm.reset();

        // 3. Gọi Edge Function gửi email ở BACKGROUND (không block UI)
        // Không await - để không làm chậm UX
        supabaseClient.functions
          .invoke("send-appointment-email", {
            body: {
              id: row?.id,
              ...payload,
              created_at: row?.created_at || new Date().toISOString(),
            },
          })
          .then(({ data: fnData, error: fnError }) => {
            if (fnError) {
              console.error("Email function error:", fnError);
              // Không hiển thị lỗi cho user vì booking đã thành công
            } else {
              console.log("Email function result:", fnData);
            }
          })
          .catch((err) => {
            console.error("Email function unexpected error:", err);
            // Không hiển thị lỗi cho user vì booking đã thành công
          });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Unexpected error:", err);
        alert(
          "Pri odosielaní nastala chyba. Skúste to prosím znova alebo nás kontaktujte telefonicky."
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  }

  // Scroll reveal using IntersectionObserver
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach((el) => el.classList.add("in-view"));
  }
});


