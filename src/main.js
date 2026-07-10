// 省份颜色映射
const PROVINCE_COLORS = {
  '北京': 'bg-red-100 text-red-700', '陕西': 'bg-yellow-100 text-yellow-700',
  '广西': 'bg-green-100 text-green-700', '浙江': 'bg-blue-100 text-blue-700',
  '湖南': 'bg-orange-100 text-orange-700', '四川': 'bg-pink-100 text-pink-700',
  '安徽': 'bg-purple-100 text-purple-700', '西藏': 'bg-indigo-100 text-indigo-700',
}

let allAttractions = []
import attractionsData from './data.js'

// 渲染星星评分
function renderStars(rating) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  let html = ''
  for (let i = 0; i < full; i++) html += '★'
  if (half) html += '☆'
  const empty = 5 - full - (half ? 1 : 0)
  for (let i = 0; i < empty; i++) html += '☆'
  return `<span class="star-rating">${html}</span>`
}

// 创建景点卡片
function createCard(attraction) {
  const colorClass = PROVINCE_COLORS[attraction.province] || 'bg-gray-100 text-gray-700'
  const tags = attraction.tags.slice(0, 3).map(t => `<span class="tag-pill text-xs">${t}</span>`).join('')
  return `
    <a href="/detail.html?id=${attraction.id}" class="block bg-white rounded-xl overflow-hidden shadow-sm card-hover">
      <div class="relative h-48 overflow-hidden">
        <img src="${attraction.images[0]}" alt="${attraction.name}" class="w-full h-full object-cover" loading="lazy" />
        <div class="absolute top-3 left-3">
          <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass} shadow-sm">${attraction.province}</span>
        </div>
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-lg font-bold text-gray-900">${attraction.name}</h3>
          <span class="text-sm text-gray-400 ml-2">${attraction.nameEn}</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          ${renderStars(attraction.rating)}
          <span class="text-sm font-semibold text-amber-500">${attraction.rating}</span>
          <span class="text-xs text-gray-400">(${attraction.reviewCount} 条评论)</span>
        </div>
        <p class="text-sm text-gray-500 line-clamp-2 mb-3">${attraction.summary}</p>
        <div class="flex flex-wrap gap-1.5">${tags}</div>
      </div>
    </a>
  `
}

// 渲染卡片网格
function renderCards(attractions) {
  const grid = document.getElementById('cardGrid')
  const skeleton = document.getElementById('skeletonGrid')
  const empty = document.getElementById('emptyState')

  grid.classList.remove('hidden')
  skeleton.classList.add('hidden')

  if (attractions.length === 0) {
    grid.classList.add('hidden')
    empty.classList.remove('hidden')
    return
  }

  empty.classList.add('hidden')
  grid.innerHTML = attractions.map(createCard).join('')
}

// 渲染页脚链接
function renderFooterLinks(attractions) {
  const container = document.getElementById('footerLinks')
  container.innerHTML = attractions.map(a =>
    `<li><a href="/detail.html?id=${a.id}" class="hover:text-white transition">${a.name}</a></li>`
  ).join('')
}

// 初始化
async function init() {
  try {
    const data = attractionsData
    allAttractions = data.attractions
    renderCards(allAttractions)
    renderFooterLinks(allAttractions)

    // 筛选按钮
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.className = b.className.replace('bg-blue-600 text-white', 'bg-gray-100 text-gray-600 hover:bg-gray-200')
        })
        btn.className = btn.className.replace('bg-gray-100 text-gray-600 hover:bg-gray-200', 'bg-blue-600 text-white')

        const filter = btn.dataset.filter
        const filtered = filter === 'all' ? allAttractions : allAttractions.filter(a => a.category === filter)
        renderCards(filtered)
      })
    })

    // 搜索
    const searchInput = document.getElementById('searchInput')
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase()
      if (!q) { renderCards(allAttractions); return }
      const filtered = allAttractions.filter(a =>
        a.name.toLowerCase().includes(q) || a.nameEn.toLowerCase().includes(q) || a.location.includes(q)
      )
      renderCards(filtered)
    })

  } catch (err) {
    console.error('加载景点数据失败:', err)
    document.getElementById('skeletonGrid').classList.add('hidden')
    document.getElementById('emptyState').classList.remove('hidden')
    document.getElementById('emptyState').querySelector('p:last-child').textContent = '加载数据失败，请刷新重试'
  }

  // 主题切换
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark')
  })
}

document.addEventListener('DOMContentLoaded', init)
