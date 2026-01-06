// Handle sticky header, mobile nav, testimonial slider, and gallery tabs

document.addEventListener("DOMContentLoaded", () => {
  // Luôn đưa trang về đầu mỗi lần load và tắt tự động khôi phục vị trí cuộn của trình duyệt
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  // Prevent horizontal scroll on mobile
  const preventHorizontalScroll = () => {
    if (window.innerWidth <= 768) {
      document.body.style.overflowX = "hidden";
      document.documentElement.style.overflowX = "hidden";
      document.body.style.width = "100%";
      document.documentElement.style.width = "100%";
      document.body.style.maxWidth = "100vw";
      document.documentElement.style.maxWidth = "100vw";
    }
  };
  preventHorizontalScroll();
  window.addEventListener("resize", preventHorizontalScroll);

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
  const galleryGrid = document.querySelector(".gallery-grid");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      galleryItems.forEach((item) => {
        const itemCats = (item.dataset.category || "").split(" ");
        const show = category === "all" || itemCats.includes(category);
        // Use block for desktop grid, flex for mobile slider
        item.style.display = show ? (window.innerWidth <= 768 ? "flex" : "block") : "none";
      });

      // Scroll to start of gallery on mobile after filter
      if (galleryGrid && window.innerWidth <= 768) {
        galleryGrid.scrollTo({ left: 0, behavior: "smooth" });
        // Reinitialize indicators after filter change
        setTimeout(() => {
          if (typeof window.updateGalleryIndicators === "function") {
            window.updateGalleryIndicators();
          }
        }, 100);
      }
      
      // Reset gallery slider after filter change
      if (typeof window.resetGallerySlider === "function") {
        window.resetGallerySlider();
      }
    });
  });

  // Gallery Auto-Slider (1 item only, auto slide sequentially)
  const initGallerySlider = () => {
    const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
    const dotsContainer = document.querySelector(".gallery-dots");
    const prevBtn = document.querySelector(".gallery-arrow-prev");
    const nextBtn = document.querySelector(".gallery-arrow-next");
    
    if (!galleryItems.length || !dotsContainer) return;
    
    // Filter visible items
    let visibleItems = galleryItems.filter(item => item.style.display !== "none");
    if (visibleItems.length === 0) return;
    
    let currentIndex = 0;
    let autoSlideInterval;
    const slideDuration = 4000; // 4 seconds per slide
    
    // Create dots
    const createDots = () => {
      dotsContainer.innerHTML = "";
      visibleItems.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.className = `gallery-dot ${index === currentIndex ? "active" : ""}`;
        dot.dataset.index = index;
        dotsContainer.appendChild(dot);
        
        dot.addEventListener("click", () => {
          goToSlide(index);
        });
      });
    };
    
    // Update active slide
    const updateSlide = () => {
      visibleItems.forEach((item, i) => {
        item.classList.toggle("active", i === currentIndex);
      });
      
      // Update dots
      dotsContainer.querySelectorAll(".gallery-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    };
    
    // Go to specific slide
    const goToSlide = (index) => {
      currentIndex = (index + visibleItems.length) % visibleItems.length;
      updateSlide();
      resetAutoSlide();
    };
    
    // Next slide (auto slide)
    const nextSlide = () => {
      goToSlide(currentIndex + 1);
    };
    
    // Previous slide
    const prevSlide = () => {
      goToSlide(currentIndex - 1);
    };
    
    // Auto slide (sequential, not random)
    const startAutoSlide = () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(nextSlide, slideDuration);
    };
    
    const resetAutoSlide = () => {
      startAutoSlide();
    };
    
    // Pause on hover
    const sliderTrack = document.querySelector(".gallery-slider-track");
    if (sliderTrack) {
      sliderTrack.addEventListener("mouseenter", () => {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
      });
      
      sliderTrack.addEventListener("mouseleave", () => {
        startAutoSlide();
      });
    }
    
    // Navigation buttons
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        nextSlide();
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prevSlide();
      });
    }
    
    // Initialize
    createDots();
    updateSlide();
    startAutoSlide();
    
    // Expose reset function for filter changes
    window.resetGallerySlider = () => {
      visibleItems = galleryItems.filter(item => item.style.display !== "none");
      if (visibleItems.length > 0) {
        currentIndex = 0;
        createDots();
        updateSlide();
        resetAutoSlide();
      }
    };
  };
  
  // Initialize gallery slider
  setTimeout(() => {
    initGallerySlider();
  }, 500);
  
  // Reinitialize on resize
  let resizeTimeoutGallery;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeoutGallery);
    resizeTimeoutGallery = setTimeout(() => {
      initGallerySlider();
    }, 250);
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
  const initFlatpickr = () => {
    const datetimeInput = document.getElementById("appointment_datetime");
    
    if (!datetimeInput) {
      console.warn("Datetime input not found");
      return;
    }

    // Wait for Flatpickr to be available
    if (typeof flatpickr === "undefined") {
      console.warn("Flatpickr not loaded, retrying...");
      setTimeout(initFlatpickr, 100);
      return;
    }

    // Ensure input is clickable and not blocked
    datetimeInput.style.cursor = "pointer";
    datetimeInput.setAttribute("autocomplete", "off");
    // Don't set readonly yet - let Flatpickr initialize first
    
    // Function to get minimum time based on selected date
    const getMinTime = (selectedDate) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selected = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : today;
      
      // If selected date is today, set min time to current time + 1 hour (rounded up to next 15 min)
      if (selected.getTime() === today.getTime()) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        // Round up to next 15-minute interval
        const roundedMinute = Math.ceil(currentMinute / 15) * 15;
        let minHour = currentHour;
        let minMinute = roundedMinute;
        
        // If rounded minute is 60, move to next hour
        if (minMinute >= 60) {
          minHour += 1;
          minMinute = 0;
        }
        
        // Add 1 hour buffer
        minHour += 1;
        
        // If minHour exceeds 23:59, return max time (but this shouldn't happen as we'll disable today)
        if (minHour >= 24) {
          return {
            hour: 23,
            minute: 59
          };
        }
        
        return {
          hour: minHour,
          minute: minMinute
        };
      }
      
      // For future dates, allow from start of day
      return {
        hour: 0,
        minute: 0
      };
    };
    
    // Function to check if today can still be booked
    const canBookToday = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const roundedMinute = Math.ceil(currentMinute / 15) * 15;
      let minHour = currentHour;
      let minMinute = roundedMinute;
      
      if (minMinute >= 60) {
        minHour += 1;
        minMinute = 0;
      }
      
      minHour += 1; // Add 1 hour buffer
      
      // If minimum booking time is after 23:00, can't book today
      return minHour < 24;
    };
    
    // Function to update minTime when date changes (real-time)
    const updateMinTime = (instance, selectedDates) => {
      // Always recalculate based on current time (real-time)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (selectedDates && selectedDates.length > 0) {
        const selectedDate = selectedDates[0];
        const selectedDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        
        // Check if selected date is today
        const isToday = selectedDay.getTime() === today.getTime();
        
        let minTime;
        if (isToday) {
          // Recalculate minTime for today based on current real-time
          minTime = getMinTime(now);
          
          // If too late to book today, update minDate to tomorrow
          if (!canBookToday()) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            instance.set("minDate", tomorrow);
            minTime = { hour: 0, minute: 0 };
          }
        } else {
          // For future dates, allow from start of day
          minTime = { hour: 0, minute: 0 };
        }
        
        const minTimeStr = `${String(minTime.hour).padStart(2, '0')}:${String(minTime.minute).padStart(2, '0')}`;
        instance.set("minTime", minTimeStr);
        
        // If current selected time is before minTime, reset to minTime
        const currentTime = instance.selectedDates[0];
        if (currentTime) {
          const currentHour = currentTime.getHours();
          const currentMinute = currentTime.getMinutes();
          const currentTimeMinutes = currentHour * 60 + currentMinute;
          const minTimeMinutes = minTime.hour * 60 + minTime.minute;
          
          if (currentTimeMinutes < minTimeMinutes) {
            const newDate = new Date(currentTime);
            newDate.setHours(minTime.hour, minTime.minute, 0, 0);
            instance.setDate(newDate, false);
          }
        }
      } else {
        // No date selected yet, update minTime for today
        if (canBookToday()) {
          const minTime = getMinTime(now);
          const minTimeStr = `${String(minTime.hour).padStart(2, '0')}:${String(minTime.minute).padStart(2, '0')}`;
          instance.set("minTime", minTimeStr);
        } else {
          instance.set("minTime", "00:00");
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          instance.set("minDate", tomorrow);
        }
      }
    };
    
    // Determine minDate - if too late today, start from tomorrow
    const minDate = canBookToday() ? "today" : new Date(new Date().setDate(new Date().getDate() + 1));
    
    // Get initial minTime
    let initialMinTime;
    if (canBookToday()) {
      initialMinTime = getMinTime(new Date());
    } else {
      initialMinTime = { hour: 0, minute: 0 };
    }
    const initialMinTimeStr = `${String(initialMinTime.hour).padStart(2, '0')}:${String(initialMinTime.minute).padStart(2, '0')}`;
    
    const flatpickrInstance = flatpickr(datetimeInput, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      minDate: minDate,
      minTime: initialMinTimeStr,
      minuteIncrement: 15,
      allowInput: false, // Prevent manual input, force calendar selection
      clickOpens: true, // Ensure calendar opens on click
      static: false, // Calendar appears as overlay (better for mobile)
      appendTo: document.body, // Append to body to avoid z-index issues
      disableMobile: false, // CRITICAL: Enable on mobile devices - force Flatpickr to work
      inline: false, // Calendar appears as overlay
      animate: true, // Smooth animations
      locale: {
        firstDayOfWeek: 1,
        weekdays: {
          shorthand: ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"],
          longhand: ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"],
        },
        months: {
          shorthand: ["Jan", "Feb", "Mar", "Apr", "Máj", "Jún", "Júl", "Aug", "Sep", "Okt", "Nov", "Dec"],
          longhand: [
            "Január",
            "Február",
            "Marec",
            "Apríl",
            "Máj",
            "Jún",
            "Júl",
            "August",
            "September",
            "Október",
            "November",
            "December",
          ],
        },
      },
      // Style theo theme luxury
      theme: "dark",
      // Mobile-friendly options
      disableMobile: false, // Enable on mobile devices
      wrap: false, // Don't wrap calendar
      // Ensure calendar is visible and accessible
      onReady: function(selectedDates, dateStr, instance) {
        // Make sure calendar is visible
        const calendar = instance.calendarContainer;
        if (calendar) {
          calendar.style.zIndex = "10000";
        }
        // Update minTime on ready
        updateMinTime(instance, selectedDates);
      },
      onChange: function(selectedDates, dateStr, instance) {
        // Update minTime when date changes
        updateMinTime(instance, selectedDates);
      },
      onReady: function(selectedDates, dateStr, instance) {
        try {
          // Make sure calendar is visible
          const calendar = instance.calendarContainer;
          if (calendar) {
            calendar.style.zIndex = "10000";
          }
          // Update minTime on ready
          updateMinTime(instance, selectedDates);
        } catch (error) {
          // Silently fail
        }
      },
      onOpen: function(selectedDates, dateStr, instance) {
        try {
          // Update minTime when calendar opens (in case time has passed)
          const now = new Date();
          if (selectedDates && selectedDates.length > 0) {
            updateMinTime(instance, selectedDates);
          } else {
            // If no date selected, update for today
            updateMinTime(instance, [now]);
          }
          
          // Ensure calendar is visible on mobile after DOM is ready
          requestAnimationFrame(() => {
            try {
              const calendar = instance.calendarContainer;
              if (calendar) {
                calendar.style.zIndex = "10000";
                // On mobile, center the calendar
                if (window.innerWidth <= 768) {
                  calendar.style.position = "fixed";
                  calendar.style.top = "50%";
                  calendar.style.left = "50%";
                  calendar.style.transform = "translate(-50%, -50%)";
                  calendar.style.maxWidth = "90vw";
                  calendar.style.width = "90vw";
                }
              }
            } catch (err) {
              // Silently fail
            }
          });
        } catch (error) {
          // Silently fail
        }
      },
      onClose: function(selectedDates, dateStr, instance) {
        // No need to set readonly - allowInput: false handles it
      },
    });

    // Function to safely open calendar
    const openCalendar = () => {
      try {
        if (!flatpickrInstance) return;
        if (flatpickrInstance.isOpen) return;
        
        // Focus input first
        datetimeInput.focus();
        
        // Then open calendar
        requestAnimationFrame(() => {
          try {
            if (flatpickrInstance && !flatpickrInstance.isOpen) {
              flatpickrInstance.open();
            }
          } catch (err) {
            // Silently fail
          }
        });
      } catch (error) {
        // Silently fail
      }
    };

    // Click handler - Flatpickr's clickOpens: true will handle it
    datetimeInput.addEventListener("click", function(e) {
      e.stopPropagation();
      // Flatpickr will handle opening automatically
    }, { passive: true });

    // Focus handler
    datetimeInput.addEventListener("focus", function(e) {
      e.preventDefault();
      e.stopPropagation();
      // Remove readonly
      datetimeInput.removeAttribute("readonly");
      // Open calendar
      openCalendar();
    });

    // Touch handlers for mobile - critical for mobile support
    let touchStartTime = 0;
    let touchStartY = 0;
    
    datetimeInput.addEventListener("touchstart", function(e) {
      touchStartTime = Date.now();
      touchStartY = e.touches[0].clientY;
      e.stopPropagation();
    }, { passive: true });

    datetimeInput.addEventListener("touchend", function(e) {
      e.stopPropagation();
      const touchDuration = Date.now() - touchStartTime;
      const touchEndY = e.changedTouches[0].clientY;
      const touchDistance = Math.abs(touchEndY - touchStartY);
      
      // Only open if it was a quick tap with minimal movement (not a scroll)
      if (touchDuration < 300 && touchDistance < 10) {
        e.preventDefault();
        // Focus and open calendar
        datetimeInput.focus();
        setTimeout(() => {
          openCalendar();
        }, 50);
      }
    }, { passive: false });

    // Prevent manual typing
    datetimeInput.addEventListener("keydown", function(e) {
      if (e.key !== "Tab" && e.key !== "Enter" && e.key !== "Escape") {
        e.preventDefault();
        openCalendar();
      }
    });

    // Handle label click
    const label = datetimeInput.closest(".datetime-label");
    if (label) {
      label.style.cursor = "pointer";
      label.style.touchAction = "auto";
      
      label.addEventListener("click", function(e) {
        if (e.target === label || e.target.tagName === "SPAN") {
          e.preventDefault();
          e.stopPropagation();
          datetimeInput.focus();
          openCalendar();
        }
      });

      label.addEventListener("touchend", function(e) {
        if (e.target === label || e.target.tagName === "SPAN") {
          e.preventDefault();
          e.stopPropagation();
          datetimeInput.focus();
          openCalendar();
        }
      }, { passive: false });
    }

    // Make input readonly after Flatpickr is ready to prevent typing
    // But allow Flatpickr to handle input first
    setTimeout(() => {
      if (flatpickrInstance) {
        datetimeInput.setAttribute("readonly", "readonly");
      }
    }, 1000);
  };

  // Initialize Flatpickr - try multiple times if needed
  let initAttempts = 0;
  const tryInitFlatpickr = () => {
    initAttempts++;
    if (initAttempts > 10) {
      console.error("Failed to initialize Flatpickr after multiple attempts");
      return;
    }
    initFlatpickr();
  };
  
  // Try immediately
  tryInitFlatpickr();
  
  // Also try after a short delay to ensure DOM is ready
  setTimeout(tryInitFlatpickr, 100);

  const contactForm = document.querySelector(".booking-form") || document.querySelector(".contact-form");
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

  // Initialize Google Map with center city view and salon marker
  const initSalonMap = () => {
    const mapFrame = document.getElementById("salon-map");
    if (!mapFrame) return;

    // Košice city center coordinates
    const cityCenterLat = 48.7164;
    const cityCenterLng = 21.2611;
    
    // Salon location from Google Maps link: https://maps.app.goo.gl/5eZg28bd8Ud3qJgW8
    // This link contains the exact location of the salon
    // We'll use Google Maps embed with the link as the place marker
    
    // Zoom level to show city center area while still showing salon marker
    // Level 13 shows city district, good for showing both city center and salon
    const zoomLevel = 13;
    
    // Google Maps embed URL:
    // Method 1: Use the Google Maps link directly - this will show marker at salon location
    // Then we adjust view to center on Košice
    // The link https://maps.app.goo.gl/5eZg28bd8Ud3qJgW8 will be used to show the marker
    const salonMapsLink = "https://maps.app.goo.gl/5eZg28bd8Ud3qJgW8";
    
    // Create embed URL that shows the salon location (from link) as marker
    // and centers the view on Košice city center
    // Using Google Maps embed format with center and place parameters
    const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2638.5!2d${cityCenterLng}!3d${cityCenterLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDQyJzU5LjAiTiAyMcKwMTUnMzkuNiJF!5e0!3m2!1ssk!2ssk!4v1234567890123!5m2!1ssk!2ssk&q=${encodeURIComponent(salonMapsLink)}&center=${cityCenterLat},${cityCenterLng}&zoom=${zoomLevel}`;
    
    // Alternative simpler approach: Use the link directly and let Google Maps handle it
    // This will show marker at salon location, we'll adjust view programmatically if needed
    const simpleMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(salonMapsLink)}&ll=${cityCenterLat},${cityCenterLng}&z=${zoomLevel}&output=embed`;
    
    mapFrame.src = simpleMapUrl;
  };

  // Initialize map when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSalonMap);
  } else {
    // Small delay to ensure iframe is ready
    setTimeout(initSalonMap, 100);
  }
});


