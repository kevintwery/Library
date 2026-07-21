document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.toggle-btn');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const panel = document.getElementById(targetId);

      document.querySelectorAll('.toggle-panel').forEach((item) => {
        item.classList.remove('open');
      });

      if (panel) {
        panel.classList.add('open');
      }
    });
  });

  const services = [
    {
      id: 1,
      name: 'Neighborhood Food Pantry',
      category: 'Food assistance',
      cost: 0,
      zipCode: '10010',
      baseDistanceMiles: 3.2,
      driveMinutes: 8,
      description: 'Free groceries, produce, and pantry staples for households in need.',
      details: 'Open Tuesday through Saturday. Walk-ins welcome and multilingual support available.',
      addedAt: '2026-07-19'
    },
    {
      id: 2,
      name: 'Bright Futures Childcare Co-op',
      category: 'Childcare',
      cost: 18.5,
      zipCode: '10012',
      baseDistanceMiles: 4.7,
      driveMinutes: 11,
      description: 'Low-cost after-school and weekend childcare for working caregivers.',
      details: 'Sliding scale rates based on household income and available spots.',
      addedAt: '2026-07-17'
    },
    {
      id: 3,
      name: 'Harbor Health Walk-In Clinic',
      category: 'Health clinics',
      cost: 25,
      zipCode: '10014',
      baseDistanceMiles: 2.4,
      driveMinutes: 6,
      description: 'Low-cost physicals, basic care, and vaccine access without long waits.',
      details: 'Accepts same-day appointments and offers interpretation services.',
      addedAt: '2026-07-16'
    },
    {
      id: 4,
      name: 'Career Launch Hub',
      category: 'Job support',
      cost: 0,
      zipCode: '10016',
      baseDistanceMiles: 5.1,
      driveMinutes: 14,
      description: 'Free resume review, interview coaching, and workforce referrals.',
      details: 'Weekly drop-in sessions and digital job board access for residents.',
      addedAt: '2026-07-20'
    },
    {
      id: 5,
      name: 'Community Ride Voucher Program',
      category: 'Transportation',
      cost: 12,
      zipCode: '10018',
      baseDistanceMiles: 6.3,
      driveMinutes: 16,
      description: 'Affordable transit support for medical visits, interviews, and school.',
      details: 'Vouchers are available for approved appointments and work-related needs.',
      addedAt: '2026-07-15'
    },
    {
      id: 6,
      name: 'Justice Center Legal Clinic',
      category: 'Legal aid',
      cost: 15,
      zipCode: '10020',
      baseDistanceMiles: 4.2,
      driveMinutes: 10,
      description: 'Low-cost legal help for housing, benefits, and family law questions.',
      details: 'Booked appointments and bilingual intake support available each week.',
      addedAt: '2026-07-14'
    },
    {
      id: 7,
      name: 'Homefront Housing Assistance',
      category: 'Housing help',
      cost: 0,
      zipCode: '10022',
      baseDistanceMiles: 7.4,
      driveMinutes: 18,
      description: 'Free referrals, rental support resources, and eviction prevention guidance.',
      details: 'Staff can help connect residents to emergency and long-term housing programs.',
      addedAt: '2026-07-18'
    }
  ];

  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const zipInput = document.getElementById('zipInput');
  const sortSelect = document.getElementById('sortSelect');
  const costFilter = document.getElementById('costFilter');
  const serviceGrid = document.getElementById('serviceGrid');
  const resultsSummary = document.getElementById('resultsSummary');
  const emptyState = document.getElementById('emptyState');

  const state = {
    searchTerm: '',
    zipCode: '',
    sortBy: 'newest',
    costFilter: 'all',
    selectedCategories: new Set(),
    favorites: new Set(JSON.parse(localStorage.getItem('commons-favorites') || '[]')),
    expandedCardId: null
  };

  function getCategories() {
    return [...new Set(services.map((service) => service.category))];
  }

  function formatCost(cost) {
    return cost === 0 ? '$0.00' : `$${cost.toFixed(2)}`;
  }

  function computeDistance(service, zipCode) {
    if (!zipCode) {
      return { miles: service.baseDistanceMiles, driveTime: service.driveMinutes };
    }

    const userZip = Number.parseInt(zipCode, 10);
    const serviceZip = Number.parseInt(service.zipCode, 10);

    if (!Number.isNaN(userZip) && !Number.isNaN(serviceZip)) {
      const diff = Math.abs(userZip - serviceZip);
      const miles = Math.max(1, Math.round((service.baseDistanceMiles + diff / 450) * 10) / 10);
      const driveTime = Math.max(5, Math.round(miles * 2.6));
      return { miles, driveTime };
    }

    return { miles: service.baseDistanceMiles, driveTime: service.driveMinutes };
  }

  function getVisibleServices() {
    const searchTerm = state.searchTerm.trim().toLowerCase();
    const selectedCategories = [...state.selectedCategories];

    return services
      .map((service) => {
        const distanceInfo = computeDistance(service, state.zipCode);
        return { ...service, distanceMiles: distanceInfo.miles, driveMinutes: distanceInfo.driveTime };
      })
      .filter((service) => {
        const matchesSearch = !searchTerm || [service.name, service.category, service.description].some((value) => value.toLowerCase().includes(searchTerm));
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(service.category);
        const matchesCost = state.costFilter === 'all'
          || (state.costFilter === 'free' && service.cost === 0)
          || (state.costFilter === 'under20' && service.cost > 0 && service.cost < 20)
          || (state.costFilter === 'under50' && service.cost > 0 && service.cost < 50);

        return matchesSearch && matchesCategory && matchesCost;
      })
      .sort((a, b) => {
        if (state.sortBy === 'cost') {
          return a.cost - b.cost || a.distanceMiles - b.distanceMiles;
        }
        if (state.sortBy === 'distance') {
          return a.distanceMiles - b.distanceMiles || a.cost - b.cost;
        }
        if (state.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return new Date(b.addedAt) - new Date(a.addedAt);
      });
  }

  function renderCategoryFilters() {
    categoryFilters.innerHTML = '';
    getCategories().forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-chip${state.selectedCategories.has(category) ? ' active' : ''}`;
      button.setAttribute('aria-pressed', state.selectedCategories.has(category) ? 'true' : 'false');
      button.textContent = category;
      button.addEventListener('click', () => {
        if (state.selectedCategories.has(category)) {
          state.selectedCategories.delete(category);
        } else {
          state.selectedCategories.add(category);
        }
        render();
      });
      categoryFilters.appendChild(button);
    });
  }

  function renderServiceCards() {
    const visibleServices = getVisibleServices();

    serviceGrid.innerHTML = '';
    emptyState.hidden = visibleServices.length > 0;

    if (visibleServices.length === 0) {
      return;
    }

    visibleServices.forEach((service) => {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.setAttribute('role', 'listitem');

      const isFavorite = state.favorites.has(service.id);
      const isExpanded = state.expandedCardId === service.id;

      card.innerHTML = `
        <div class="card-top">
          <span class="service-badge">${service.category}</span>
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" type="button" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remove from favorites' : 'Save to favorites'}">
            ${isFavorite ? '♥' : '♡'}
          </button>
        </div>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <div class="service-meta">
          <div class="meta-item">
            <strong>Exact cost</strong>
            <span>${formatCost(service.cost)}</span>
          </div>
          <div class="meta-item">
            <strong>Distance</strong>
            <span>${service.distanceMiles.toFixed(1)} mi</span>
          </div>
          <div class="meta-item">
            <strong>Drive time</strong>
            <span>${service.driveMinutes} min</span>
          </div>
          <div class="meta-item">
            <strong>Zip code</strong>
            <span>${service.zipCode}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="secondary-btn" type="button" data-action="details">${isExpanded ? 'Hide details' : 'View details'}</button>
          <button class="primary-btn" type="button" data-action="favorite">${isFavorite ? 'Saved' : 'Save service'}</button>
        </div>
        ${isExpanded ? `<div class="service-details">${service.details}</div>` : ''}
      `;

      card.querySelector('[data-action="details"]').addEventListener('click', () => {
        state.expandedCardId = isExpanded ? null : service.id;
        render();
      });

      const favoriteButtons = card.querySelectorAll('[data-action="favorite"], .favorite-btn');
      favoriteButtons.forEach((favoriteButton) => {
        favoriteButton.addEventListener('click', () => {
          if (state.favorites.has(service.id)) {
            state.favorites.delete(service.id);
          } else {
            state.favorites.add(service.id);
          }
          localStorage.setItem('commons-favorites', JSON.stringify([...state.favorites]));
          render();
        });
      });

      serviceGrid.appendChild(card);
    });
  }

  function renderSummary() {
    const visibleServices = getVisibleServices();
    const favoriteCount = state.favorites.size;
    resultsSummary.textContent = `${visibleServices.length} service${visibleServices.length === 1 ? '' : 's'} shown${favoriteCount ? ` • ${favoriteCount} saved` : ''}`;
  }

  function render() {
    renderCategoryFilters();
    renderSummary();
    renderServiceCards();
  }

  searchInput.addEventListener('input', (event) => {
    state.searchTerm = event.target.value;
    render();
  });

  zipInput.addEventListener('input', (event) => {
    state.zipCode = event.target.value;
    render();
  });

  sortSelect.addEventListener('change', (event) => {
    state.sortBy = event.target.value;
    render();
  });

  costFilter.addEventListener('change', (event) => {
    state.costFilter = event.target.value;
    render();
  });

  render();
});
