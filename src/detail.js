let allAttractions = []

// URL 参数读取
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name)
}

// 渲染星星
function renderStars(rating) {
  const full = Math.floor(rating)
  let html = ''
  for (let i = 0; i < full; i++) html += '★'
  const empty = 5 - full
  for (let i = 0; i < empty; i++) html += '☆'
  return html
}

// 轮播图
let carouselInterval = null
function initCarousel(images) {
  const container = document.getElementById('imageCarousel')
  const dotsContainer = document.getElementById('carouselDots')
  if (!images || images.length === 0) {
    container.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-6xl">🗺️</div>`
    return
  }
  container.innerHTML = images.map((img, i) =>
    `<img src="${img}" alt="景点图片 ${i + 1}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}" data-index="${i}" />`
  ).join('')
  dotsContainer.innerHTML = images.map((_, i) =>
    `<button class="w-2.5 h-2.5 rounded-full transition-all ${i === 0 ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}" data-dot="${i}"></button>`
  ).join('')

  let current = 0
  const imgs = container.querySelectorAll('img')
  const dots = dotsContainer.querySelectorAll('button')

  function show(idx) {
    imgs.forEach((img, i) => img.style.opacity = i === idx ? '1' : '0')
    dots.forEach((dot, i) => {
      dot.className = `w-2.5 h-2.5 rounded-full transition-all ${i === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`
    })
    current = idx
  }

  dots.forEach(dot => dot.addEventListener('click', () => show(parseInt(dot.dataset.dot))))

  if (carouselInterval) clearInterval(carouselInterval)
  if (images.length > 1) {
    carouselInterval = setInterval(() => {
      show((current + 1) % images.length)
    }, 4000)
  }

  // 鼠标悬停暂停轮播
  container.addEventListener('mouseenter', () => { if (carouselInterval) clearInterval(carouselInterval) })
  container.addEventListener('mouseleave', () => {
    if (carouselInterval) clearInterval(carouselInterval)
    if (images.length > 1) carouselInterval = setInterval(() => show((current + 1) % images.length), 4000)
  })
}

// 渲染基本信息
function renderBasicInfo(info) {
  const items = [
    { label: '📍 地址', value: info.address },
    { label: '🕐 开放时间', value: info.openHours },
    { label: '🎫 门票价格', value: info.ticketPrices },
    { label: '⏱ 建议游玩', value: info.suggestedDuration },
    { label: '🌤 最佳季节', value: info.bestSeason },
  ]
  if (info.website) items.push({ label: '🌐 官网', value: `<a href="${info.website}" target="_blank" rel="noopener" class="text-blue-600 hover:underline">${info.website}</a>` })
  const grid = document.getElementById('basicInfoGrid')
  grid.innerHTML = items.map(item =>
    `<div class="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
      <p class="info-label mb-1">${item.label}</p>
      <p class="info-value">${item.value}</p>
    </div>`
  ).join('')
}

// 渲染交通指南
function renderTransport(transport) {
  const html = `
    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <h3 class="font-semibold text-gray-800 mb-3">✈️ 外部交通</h3>
      <ul>${transport.external.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <h3 class="font-semibold text-gray-800 mb-3">🚌 内部交通</h3>
      <ul>${transport.internal.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <h3 class="font-semibold text-gray-800 mb-3">🏙️ 从市区出发</h3>
      <p class="text-gray-600 leading-relaxed">${transport.fromCity}</p>
    </div>
  `
  document.getElementById('transportContent').innerHTML = html
}

// 渲染路线
function renderRoutes(routes) {
  const container = document.getElementById('routesContent')
  container.innerHTML = routes.map(r => `
    <div class="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
      <div class="flex items-start justify-between mb-2">
        <h3 class="font-semibold text-gray-800">${r.name}</h3>
        <div class="flex gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-600">${r.duration}</span>
          <span class="px-2 py-0.5 rounded bg-orange-50 text-orange-600">${r.difficulty}</span>
          <span class="px-2 py-0.5 rounded bg-green-50 text-green-600">${r.distance}</span>
        </div>
      </div>
      <p class="text-gray-600 text-sm leading-relaxed mb-2">${r.schedule}</p>
      <p class="text-xs text-gray-400">👤 适合人群：${r.suitableFor}</p>
    </div>
  `).join('')
}

// 渲染美食
function renderFood(food) {
  if (!food) return
  let html = ''
  if (food.mustEat && food.mustEat.length > 0) {
    html += `<div class="mb-4"><h3 class="font-semibold text-gray-800 mb-2">必尝美食</h3><div class="flex flex-wrap gap-2">${food.mustEat.map(item => `<span class="tag-pill">${item}</span>`).join('')}</div></div>`
  }
  if (food.restaurants && food.restaurants.length > 0) {
    html += `<h3 class="font-semibold text-gray-800 mb-2">推荐餐厅</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-3">`
    html += food.restaurants.map(r =>
      `<div class="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <p class="font-medium text-gray-800">${r.name}</p>
        <p class="text-sm text-gray-500">${r.specialty}</p>
        <p class="text-sm text-orange-600 font-medium">${r.price}</p>
      </div>`
    ).join('')
    html += `</div>`
  }
  document.getElementById('foodContent').innerHTML = html
}

// 渲染住宿
function renderAccommodation(acc) {
  if (!acc) return
  const items = [
    { key: 'budget', title: '💰 经济型', icon: '🛏️' },
    { key: 'comfort', title: '⭐ 舒适型', icon: '🏨' },
    { key: 'luxury', title: '👑 豪华型', icon: '🏰' },
  ]
  const container = document.getElementById('accommodationContent')
  container.innerHTML = items.map(item => {
    const data = acc[item.key]
    if (!data) return ''
    return `
      <div class="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
        <p class="font-semibold text-gray-800 mb-2">${item.icon} ${item.title}</p>
        <p class="text-sm text-gray-500 mb-1">${data.area}</p>
        <p class="text-sm text-orange-600 font-medium mb-1">${data.price}</p>
        <p class="text-xs text-gray-400">推荐：${data.suggested}</p>
      </div>
    `
  }).join('')
}

// 渲染实用贴士
function renderTips(tips) {
  if (!tips) return
  const items = [
    { key: 'notes', title: '📌 注意事项', icon: '⚠️' },
    { key: 'photoSpots', title: '📸 最佳拍照机位', icon: '📷' },
    { key: 'pitfalls', title: '🚫 避坑指南', icon: '💡' },
  ]
  let html = ''
  items.forEach(item => {
    const data = tips[item.key]
    if (!data || data.length === 0) return
    html += `
      <div class="mb-4">
        <h3 class="font-semibold text-gray-800 mb-2">${item.icon} ${item.title}</h3>
        <ul>${data.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
    `
  })
  if (tips.nearbyAttractions && tips.nearbyAttractions.length > 0) {
    html += `
      <div class="mb-4">
        <h3 class="font-semibold text-gray-800 mb-2">🏞️ 周边联游</h3>
        <div class="flex flex-wrap gap-2">${tips.nearbyAttractions.map(item => `<span class="tag-pill bg-green-50 text-green-700">${item}</span>`).join('')}</div>
      </div>
    `
  }
  document.getElementById('tipsContent').innerHTML = html
}

// 渲染 TOC 导航
function renderTOC() {
  const headings = document.querySelectorAll('.detail-content h2')
  const nav = document.getElementById('tocNav')
  if (headings.length === 0) { nav.parentElement.classList.add('hidden'); return }
  nav.innerHTML = Array.from(headings).map(h =>
    `<a href="#${h.parentElement.id}" class="block text-gray-500 hover:text-blue-600 transition">${h.textContent}</a>`
  ).join('')
}

// 渲染相关景点
function renderRelated(current, all) {
  const container = document.getElementById('relatedAttractions')
  const related = all.filter(a => a.id !== current.id && (a.category === current.category || a.province === current.province)).slice(0, 4)
  if (related.length === 0) { container.parentElement.classList.add('hidden'); return }
  container.innerHTML = related.map(a =>
    `<a href="/detail.html?id=${a.id}" class="bg-white rounded-lg overflow-hidden shadow-sm card-hover">
      <img src="${a.images[0]}" alt="${a.name}" class="w-full h-32 object-cover" loading="lazy" />
      <div class="p-3">
        <p class="font-semibold text-gray-800 text-sm">${a.name}</p>
        <p class="text-xs text-gray-400 mt-1">${a.province} · ${a.category}</p>
      </div>
    </a>`
  ).join('')
}

// 更新页面标题
function updateSEO(attraction) {
  document.title = `${attraction.name}攻略 - ${attraction.nameEn} - 中国十大旅行攻略`
  document.querySelector('meta[name="description"]').content = `${attraction.name}旅行攻略：${attraction.summary}`
}

// 主渲染函数
function renderDetail(attraction) {
  // Hero
  document.getElementById('heroName').textContent = attraction.name
  document.getElementById('heroNameEn').textContent = attraction.nameEn
  document.getElementById('heroProvince').textContent = `${attraction.location} · ${attraction.category}`
  document.getElementById('heroRating').innerHTML = renderStars(attraction.rating)
  document.getElementById('heroRatingNum').textContent = `${attraction.rating} (${attraction.reviewCount} 条评论)`
  initCarousel(attraction.images)

  // 面包屑
  document.getElementById('breadcrumbName').textContent = attraction.name

  // 各模块
  document.getElementById('detailDescription').textContent = attraction.description
  renderBasicInfo(attraction.basicInfo)
  renderTransport(attraction.transport)
  renderRoutes(attraction.routes)
  renderFood(attraction.food)
  renderAccommodation(attraction.accommodation)
  renderTips(attraction.tips)

  // 侧边导航 & SEO
  renderTOC()
  updateSEO(attraction)

  // 隐藏骨架，显示内容
  document.getElementById('skeleton').classList.add('hidden')
  document.getElementById('detailContent').classList.remove('hidden')
}

// 初始化
async function init() {
  const id = getParam('id')
  if (!id) {
    document.getElementById('skeleton').classList.add('hidden')
    document.getElementById('errorState').classList.remove('hidden')
    document.getElementById('errorState').querySelector('h2').textContent = '缺少景点ID'
    document.getElementById('errorState').querySelector('p').textContent = '请从首页选择景点进入查看详情'
    return
  }

  try {
    const res = await fetch('/data/attractions.json')
    const data = await res.json()
    allAttractions = data.attractions
    const attraction = allAttractions.find(a => a.id === id)
    if (!attraction) throw new Error('not found')
    renderDetail(attraction)
    renderRelated(attraction, allAttractions)
  } catch (err) {
    console.error('加载失败:', err)
    document.getElementById('skeleton').classList.add('hidden')
    document.getElementById('errorState').classList.remove('hidden')
  }
}

document.addEventListener('DOMContentLoaded', init)
