'use client'
import React, { useState, useMemo } from 'react'

const EMOJI_DATA: Record<string, { emoji: string; name: string }[]> = {
  '😀 Smileys': [
    {emoji:'😀',name:'grinning'},{emoji:'😃',name:'smiley'},{emoji:'😄',name:'smile'},{emoji:'😁',name:'grin'},{emoji:'😆',name:'laughing'},{emoji:'😅',name:'sweat smile'},{emoji:'🤣',name:'rofl'},{emoji:'😂',name:'joy'},{emoji:'🙂',name:'slightly smiling'},{emoji:'🙃',name:'upside down'},{emoji:'😉',name:'wink'},{emoji:'😊',name:'blush'},{emoji:'😇',name:'innocent'},{emoji:'🥰',name:'smiling hearts'},{emoji:'😍',name:'heart eyes'},{emoji:'🤩',name:'star struck'},{emoji:'😘',name:'kissing heart'},{emoji:'😗',name:'kissing'},{emoji:'😚',name:'kissing closed eyes'},{emoji:'😙',name:'kissing smiling'},{emoji:'🥲',name:'smiling tear'},{emoji:'😋',name:'yum'},{emoji:'😛',name:'stuck out tongue'},{emoji:'😜',name:'winking tongue'},{emoji:'🤪',name:'zany'},{emoji:'😝',name:'squinting tongue'},{emoji:'🤑',name:'money mouth'},{emoji:'🤗',name:'hugging'},{emoji:'🤭',name:'hand over mouth'},{emoji:'🤫',name:'shushing'},{emoji:'🤔',name:'thinking'},{emoji:'🫡',name:'saluting'},{emoji:'🤐',name:'zipper mouth'},{emoji:'🤨',name:'raised eyebrow'},{emoji:'😐',name:'neutral'},{emoji:'😑',name:'expressionless'},{emoji:'😶',name:'no mouth'},{emoji:'🫥',name:'dotted line'},{emoji:'😏',name:'smirk'},{emoji:'😒',name:'unamused'},{emoji:'🙄',name:'eye roll'},{emoji:'😬',name:'grimacing'},{emoji:'🤥',name:'lying'},{emoji:'😌',name:'relieved'},{emoji:'😔',name:'pensive'},{emoji:'😪',name:'sleepy'},{emoji:'🤤',name:'drooling'},{emoji:'😴',name:'sleeping'},{emoji:'😷',name:'mask'},{emoji:'🤒',name:'thermometer'},{emoji:'🤕',name:'bandage'},{emoji:'🤢',name:'nauseated'},{emoji:'🤮',name:'vomiting'},{emoji:'🥵',name:'hot'},{emoji:'🥶',name:'cold'},{emoji:'🥴',name:'woozy'},{emoji:'😵',name:'dizzy'},{emoji:'🤯',name:'exploding head'},{emoji:'🤠',name:'cowboy'},{emoji:'🥳',name:'partying'},{emoji:'🥸',name:'disguised'},{emoji:'😎',name:'sunglasses'},{emoji:'🤓',name:'nerd'},{emoji:'🧐',name:'monocle'},
  ],
  '👋 Hands': [
    {emoji:'👋',name:'wave'},{emoji:'🤚',name:'raised back'},{emoji:'🖐️',name:'splayed'},{emoji:'✋',name:'raised hand'},{emoji:'🖖',name:'vulcan'},{emoji:'🫱',name:'rightward'},{emoji:'🫲',name:'leftward'},{emoji:'🫳',name:'palm down'},{emoji:'🫴',name:'palm up'},{emoji:'👌',name:'ok'},{emoji:'🤌',name:'pinched'},{emoji:'🤏',name:'pinching'},{emoji:'✌️',name:'victory'},{emoji:'🤞',name:'crossed fingers'},{emoji:'🫰',name:'hand with index thumb'},{emoji:'🤟',name:'love you'},{emoji:'🤘',name:'rock on'},{emoji:'🤙',name:'call me'},{emoji:'👈',name:'point left'},{emoji:'👉',name:'point right'},{emoji:'👆',name:'point up'},{emoji:'🖕',name:'middle finger'},{emoji:'👇',name:'point down'},{emoji:'☝️',name:'index up'},{emoji:'🫵',name:'point at viewer'},{emoji:'👍',name:'thumbs up'},{emoji:'👎',name:'thumbs down'},{emoji:'✊',name:'fist'},{emoji:'👊',name:'punch'},{emoji:'🤛',name:'left fist'},{emoji:'🤜',name:'right fist'},{emoji:'👏',name:'clap'},{emoji:'🙌',name:'raised hands'},{emoji:'🫶',name:'heart hands'},{emoji:'👐',name:'open hands'},{emoji:'🤲',name:'palms up'},{emoji:'🤝',name:'handshake'},{emoji:'🙏',name:'pray'},{emoji:'💪',name:'flexed bicep'},
  ],
  '❤️ Hearts': [
    {emoji:'❤️',name:'red heart'},{emoji:'🧡',name:'orange heart'},{emoji:'💛',name:'yellow heart'},{emoji:'💚',name:'green heart'},{emoji:'💙',name:'blue heart'},{emoji:'💜',name:'purple heart'},{emoji:'🖤',name:'black heart'},{emoji:'🤍',name:'white heart'},{emoji:'🤎',name:'brown heart'},{emoji:'💔',name:'broken heart'},{emoji:'❣️',name:'heart exclamation'},{emoji:'💕',name:'two hearts'},{emoji:'💞',name:'revolving hearts'},{emoji:'💓',name:'heartbeat'},{emoji:'💗',name:'growing heart'},{emoji:'💖',name:'sparkling heart'},{emoji:'💘',name:'heart arrow'},{emoji:'💝',name:'heart ribbon'},{emoji:'💟',name:'heart decoration'},{emoji:'🫀',name:'anatomical heart'},{emoji:'❤️‍🔥',name:'heart on fire'},{emoji:'❤️‍🩹',name:'mending heart'},
  ],
  '🐶 Animals': [
    {emoji:'🐶',name:'dog'},{emoji:'🐱',name:'cat'},{emoji:'🐭',name:'mouse'},{emoji:'🐹',name:'hamster'},{emoji:'🐰',name:'rabbit'},{emoji:'🦊',name:'fox'},{emoji:'🐻',name:'bear'},{emoji:'🐼',name:'panda'},{emoji:'🐨',name:'koala'},{emoji:'🐯',name:'tiger'},{emoji:'🦁',name:'lion'},{emoji:'🐮',name:'cow'},{emoji:'🐷',name:'pig'},{emoji:'🐸',name:'frog'},{emoji:'🐵',name:'monkey'},{emoji:'🐔',name:'chicken'},{emoji:'🐧',name:'penguin'},{emoji:'🐦',name:'bird'},{emoji:'🦅',name:'eagle'},{emoji:'🦆',name:'duck'},{emoji:'🦉',name:'owl'},{emoji:'🦇',name:'bat'},{emoji:'🐺',name:'wolf'},{emoji:'🐗',name:'boar'},{emoji:'🐴',name:'horse'},{emoji:'🦄',name:'unicorn'},{emoji:'🐝',name:'bee'},{emoji:'🪱',name:'worm'},{emoji:'🐛',name:'bug'},{emoji:'🦋',name:'butterfly'},{emoji:'🐌',name:'snail'},{emoji:'🐞',name:'ladybug'},{emoji:'🐙',name:'octopus'},{emoji:'🦑',name:'squid'},{emoji:'🦀',name:'crab'},{emoji:'🐠',name:'fish'},{emoji:'🐬',name:'dolphin'},{emoji:'🐳',name:'whale'},{emoji:'🦈',name:'shark'},{emoji:'🐊',name:'crocodile'},{emoji:'🐅',name:'tiger2'},{emoji:'🐆',name:'leopard'},{emoji:'🦓',name:'zebra'},{emoji:'🦍',name:'gorilla'},{emoji:'🐘',name:'elephant'},{emoji:'🦏',name:'rhino'},{emoji:'🐪',name:'camel'},{emoji:'🦒',name:'giraffe'},{emoji:'🦘',name:'kangaroo'},
  ],
  '🍔 Food': [
    {emoji:'🍎',name:'apple'},{emoji:'🍐',name:'pear'},{emoji:'🍊',name:'orange'},{emoji:'🍋',name:'lemon'},{emoji:'🍌',name:'banana'},{emoji:'🍉',name:'watermelon'},{emoji:'🍇',name:'grapes'},{emoji:'🍓',name:'strawberry'},{emoji:'🫐',name:'blueberries'},{emoji:'🍈',name:'melon'},{emoji:'🍒',name:'cherry'},{emoji:'🍑',name:'peach'},{emoji:'🥭',name:'mango'},{emoji:'🍍',name:'pineapple'},{emoji:'🥥',name:'coconut'},{emoji:'🥝',name:'kiwi'},{emoji:'🍅',name:'tomato'},{emoji:'🥑',name:'avocado'},{emoji:'🍔',name:'hamburger'},{emoji:'🍟',name:'fries'},{emoji:'🍕',name:'pizza'},{emoji:'🌭',name:'hotdog'},{emoji:'🥪',name:'sandwich'},{emoji:'🌮',name:'taco'},{emoji:'🌯',name:'burrito'},{emoji:'🍣',name:'sushi'},{emoji:'🍱',name:'bento'},{emoji:'🍜',name:'noodles'},{emoji:'🍝',name:'spaghetti'},{emoji:'🍦',name:'ice cream'},{emoji:'🍩',name:'donut'},{emoji:'🍪',name:'cookie'},{emoji:'🎂',name:'cake'},{emoji:'🍰',name:'shortcake'},{emoji:'☕',name:'coffee'},{emoji:'🍵',name:'tea'},{emoji:'🧃',name:'juice box'},{emoji:'🍺',name:'beer'},{emoji:'🍷',name:'wine'},
  ],
  '⚽ Sports': [
    {emoji:'⚽',name:'soccer'},{emoji:'🏀',name:'basketball'},{emoji:'🏈',name:'football'},{emoji:'⚾',name:'baseball'},{emoji:'🥎',name:'softball'},{emoji:'🎾',name:'tennis'},{emoji:'🏐',name:'volleyball'},{emoji:'🏉',name:'rugby'},{emoji:'🎱',name:'pool'},{emoji:'🏓',name:'ping pong'},{emoji:'🏸',name:'badminton'},{emoji:'🏒',name:'hockey'},{emoji:'🥊',name:'boxing'},{emoji:'🥋',name:'martial arts'},{emoji:'🏋️',name:'weight lifting'},{emoji:'🤸',name:'cartwheeling'},{emoji:'🏊',name:'swimming'},{emoji:'🚴',name:'cycling'},{emoji:'🧗',name:'climbing'},{emoji:'🏄',name:'surfing'},{emoji:'🎯',name:'bullseye'},{emoji:'🏆',name:'trophy'},{emoji:'🥇',name:'gold medal'},{emoji:'🥈',name:'silver medal'},{emoji:'🥉',name:'bronze medal'},
  ],
  '🚀 Objects': [
    {emoji:'⌚',name:'watch'},{emoji:'📱',name:'phone'},{emoji:'💻',name:'laptop'},{emoji:'⌨️',name:'keyboard'},{emoji:'🖥️',name:'desktop'},{emoji:'🖨️',name:'printer'},{emoji:'🖱️',name:'mouse'},{emoji:'💡',name:'lightbulb'},{emoji:'🔋',name:'battery'},{emoji:'🔌',name:'plug'},{emoji:'💎',name:'gem'},{emoji:'🔧',name:'wrench'},{emoji:'🔨',name:'hammer'},{emoji:'🪛',name:'screwdriver'},{emoji:'🔑',name:'key'},{emoji:'🏠',name:'house'},{emoji:'🚗',name:'car'},{emoji:'✈️',name:'airplane'},{emoji:'🚀',name:'rocket'},{emoji:'🛸',name:'ufo'},{emoji:'🎸',name:'guitar'},{emoji:'🎹',name:'piano'},{emoji:'🎺',name:'trumpet'},{emoji:'🎨',name:'art palette'},{emoji:'🎬',name:'clapperboard'},{emoji:'📷',name:'camera'},{emoji:'📸',name:'flash camera'},{emoji:'📹',name:'video camera'},{emoji:'🔔',name:'bell'},{emoji:'📧',name:'email'},{emoji:'✉️',name:'envelope'},{emoji:'📦',name:'package'},{emoji:'🗓️',name:'calendar'},{emoji:'📌',name:'pin'},{emoji:'✏️',name:'pencil'},{emoji:'📝',name:'memo'},
  ],
  '🏳️ Flags & Symbols': [
    {emoji:'🏳️',name:'white flag'},{emoji:'🏴',name:'black flag'},{emoji:'🏁',name:'checkered flag'},{emoji:'🚩',name:'red flag'},{emoji:'✅',name:'check mark'},{emoji:'❌',name:'cross mark'},{emoji:'❓',name:'question'},{emoji:'❗',name:'exclamation'},{emoji:'⭐',name:'star'},{emoji:'🌟',name:'glowing star'},{emoji:'💫',name:'dizzy star'},{emoji:'✨',name:'sparkles'},{emoji:'🔥',name:'fire'},{emoji:'💥',name:'boom'},{emoji:'💯',name:'100'},{emoji:'♻️',name:'recycle'},{emoji:'🔴',name:'red circle'},{emoji:'🟠',name:'orange circle'},{emoji:'🟡',name:'yellow circle'},{emoji:'🟢',name:'green circle'},{emoji:'🔵',name:'blue circle'},{emoji:'🟣',name:'purple circle'},{emoji:'⚫',name:'black circle'},{emoji:'⚪',name:'white circle'},{emoji:'🟤',name:'brown circle'},{emoji:'⬛',name:'black square'},{emoji:'⬜',name:'white square'},{emoji:'🔶',name:'orange diamond'},{emoji:'🔷',name:'blue diamond'},{emoji:'♠️',name:'spades'},{emoji:'♥️',name:'hearts'},{emoji:'♦️',name:'diamonds'},{emoji:'♣️',name:'clubs'},
  ],
}

export default function EmojiClient() {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = Object.keys(EMOJI_DATA)

  const filteredData = useMemo(() => {
    if (!search.trim()) return EMOJI_DATA
    const q = search.toLowerCase()
    const result: typeof EMOJI_DATA = {}
    for (const [cat, emojis] of Object.entries(EMOJI_DATA)) {
      const filtered = emojis.filter(e => e.name.includes(q) || e.emoji.includes(q))
      if (filtered.length > 0) result[cat] = filtered
    }
    return result
  }, [search])

  const displayData = activeCategory && !search.trim()
    ? { [activeCategory]: EMOJI_DATA[activeCategory] || [] }
    : filteredData

  const copyEmoji = (emoji: string) => {
    navigator.clipboard.writeText(emoji)
    setCopied(emoji)
    setRecent(prev => [emoji, ...prev.filter(e => e !== emoji)].slice(0, 20))
    setTimeout(() => setCopied(null), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search emojis... (e.g. smile, heart, fire)"
          className="w-full bg-muted/30 border border-border rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-lg" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCategory(null)} className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${!activeCategory ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>All</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${activeCategory === cat ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>{cat.split(' ')[0]}</button>
        ))}
      </div>

      {/* Recent */}
      {recent.length > 0 && !search && (
        <div className="bg-card border border-border p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Recently Used</h3>
          <div className="flex flex-wrap gap-1">
            {recent.map((e, i) => (
              <button key={i} onClick={() => copyEmoji(e)} className="text-2xl p-1.5 rounded-lg hover:bg-brand-orange/10 transition-colors">{e}</button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Grid */}
      <div className="space-y-8">
        {Object.entries(displayData).map(([cat, emojis]) => (
          <div key={cat} className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold font-syne mb-4">{cat}</h3>
            <div className="flex flex-wrap gap-1">
              {emojis.map((e, i) => (
                <button key={i} onClick={() => copyEmoji(e.emoji)} title={e.name}
                  className={`text-3xl p-2 rounded-xl transition-all hover:bg-brand-orange/10 hover:scale-110 ${copied === e.emoji ? 'bg-green-500/20 scale-125' : ''}`}>
                  {e.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(displayData).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-5xl mb-4">🔍</p>
            <p>No emojis found for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>

      {copied && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-2xl font-bold shadow-xl animate-in fade-in slide-in-from-bottom-4 z-50">
          {copied} Copied!
        </div>
      )}
    </div>
  )
}
