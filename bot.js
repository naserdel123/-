const TelegramBot = require('node-telegram-bot-api');
const yts = require('yt-search');
const axios = require('axios');

// ✅ التوكن من متغيرات البيئة (Environment Variables)
const token = process.env.BOT_TOKEN;

if (!token) {
    console.error('❌ خطأ: BOT_TOKEN غير موجود!');
    console.error('أضف BOT_TOKEN في Environment Variables في Render');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// تخزين الهمسات
const whispers = new Map();

// كلمات ممنوعة (يمكنك تعديلها)
const badWords = ['كلمة1', 'كلمة2', 'كلمة3', 'شتم', 'سب', 'قذف'];

console.log('✅ البوت يعمل على Render!');
console.log('🤖 جاري الاستماع للرسائل...');

// ==================== /start ====================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;
    
    const welcome = `
👋 أهلاً ${name}!

🤖 أنا بوت متعدد المهام:

🎵 *بحث يوتيوب* - اكتب: بحث [اسم الأغنية]
📷 *بحث صور* - اكتب: صورة [اسم الشخص/الشيء]
💬 *همسة سرية* - رد على رسالة شخص واكتب: همس [رسالتك]

⚠️ *مميزات إضافية:*
• حذف الرسائل التي تحتوي على شتم تلقائياً

📝 *طريقة الاستخدام:*
أضفني إلى قروبك واستخدم الأوامر أعلاه!

➕ [اضفني لقروبك](https://t.me/${bot.options.username}?startgroup=true)
    `;
    
    bot.sendMessage(chatId, welcome, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// ==================== /help ====================
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const help = `
📚 *طريقة الاستخدام:*

🎵 *البحث في يوتيوب:*
\`بحث عمرو دياب\`
\`بحث أغنية حبيبي يا نور العين\`

📷 *البحث عن صور:*
\`صورة القمر\`
\`صور قطط\`

💬 *الهمسات السرية:*
1. رد على رسالة الشخص
2. اكتب: \`همس أحبك\`
3. سأرسل الهمسة سراً!

⚠️ *الحماية:*
• أحذف الشتائم تلقائياً
    `;
    
    bot.sendMessage(chatId, help, { parse_mode: 'Markdown' });
});

// ==================== بحث يوتيوب ====================
bot.onText(/بحث\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    const loadingMsg = await bot.sendMessage(chatId, `🔍 جاري البحث عن: "${query}"...`);
    
    try {
        const search = await yts(query);
        const videos = search.videos.slice(0, 3); // 3 نتائج فقط
        
        // حذف رسالة التحميل
        bot.deleteMessage(chatId, loadingMsg.message_id);
        
        if (videos.length === 0) {
            return bot.sendMessage(chatId, '❌ لم أجد نتائج للبحث');
        }
        
        for (const video of videos) {
            const message = `
🎵 *${video.title}*

👤 ${video.author.name}
⏱️ ${video.timestamp} | 👁️ ${formatNumber(video.views)}
📅 ${video.ago}

[▶️ شاهد على يوتيوب](${video.url})
            `;
            
            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: false,
                reply_markup: {
                    inline_keyboard: [[
                        { text: '▶️ مشاهدة', url: video.url }
                    ]]
                }
            });
        }
        
    } catch (error) {
        console.error('خطأ في البحث:', error);
        bot.sendMessage(chatId, '❌ حدث خطأ أثناء البحث');
    }
});

// ==================== بحث صور ====================
bot.onText(/صور[ةه]?\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    const loadingMsg = await bot.sendMessage(chatId, `📷 جاري البحث عن: "${query}"...`);
    
    try {
        // استخدام Lorem Picsum (مجاني ولا يحتاج API)
        for (let i = 0; i < 3; i++) {
            const imageUrl = `https://picsum.photos/seed/${query}${i}/400/300`;
            
            await bot.sendPhoto(chatId, imageUrl, {
                caption: i === 0 ? `📷 نتائج البحث عن: ${query}` : ''
            });
        }
        
        bot.deleteMessage(chatId, loadingMsg.message_id);
        
    } catch (error) {
        console.error('خطأ في الصور:', error);
        bot.sendMessage(chatId, '❌ حدث خطأ في البحث عن الصور');
    }
});

// ==================== همسات ====================
bot.onText(/همس\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    
    if (!msg.reply_to_message) {
        return bot.sendMessage(chatId, '⚠️ عليك الرد على رسالة الشخص المراد إرسال الهمسة له');
    }
    
    const target = msg.reply_to_message.from;
    const sender = msg.from;
    
    // إرسال للمستهدف
    try {
        await bot.sendMessage(target.id, `
🤫 *همسة سرية من ${sender.first_name}:*

💬 ${text}

📍 من قروب: ${msg.chat.title || 'محادثة خاصة'}
        `, { parse_mode: 'Markdown' });
        
        // تأكيد للمرسل
        bot.sendMessage(chatId, `✅ تم إرسال الهمسة سراً إلى ${target.first_name}`);
        
    } catch (error) {
        // إذا لم يبدأ المستخدم محادثة مع البوت
        const whisperId = Date.now().toString();
        whispers.set(whisperId, { text, sender: sender.first_name, targetId: target.id });
        
        bot.sendMessage(chatId, `
🤫 ${target.first_name}:
📩 لديك همسة سرية من ${sender.first_name}
        `, {
            reply_markup: {
                inline_keyboard: [[
                    { text: '📩 اضغط لقراءة الهمسة', callback_data: `whisper_${whisperId}` }
                ]]
            }
        });
    }
});

// معالجة الضغط على زر الهمسة
bot.on('callback_query', async (query) => {
    const data = query.data;
    
    if (data.startsWith('whisper_')) {
        const id = data.replace('whisper_', '');
        const whisper = whispers.get(id);
        
        if (!whisper) {
            return bot.answerCallbackQuery(query.id, {
                text: '❌ الهمسة منتهية الصلاحية',
                show_alert: true
            });
        }
        
        await bot.sendMessage(query.from.id, `
🤫 *همسة من ${whisper.sender}:*

💬 ${whisper.text}
        `, { parse_mode: 'Markdown' });
        
        bot.answerCallbackQuery(query.id, {
            text: '✅ تم إرسال الهمسة لك في الخاص',
            show_alert: true
        });
    }
});

// ==================== حماية من الشتم ====================
bot.on('message', async (msg) => {
    if (!msg.text || msg.chat.type === 'private') return;
    
    const text = msg.text.toLowerCase();
    const hasBadWord = badWords.some(word => text.includes(word));
    
    if (hasBadWord) {
        try {
            // حذف الرسالة
            await bot.deleteMessage(msg.chat.id, msg.message_id);
            
            // إرسال تحذير
            const warning = await bot.sendMessage(msg.chat.id, 
                `⚠️ @${msg.from.username || msg.from.first_name}\n🚫 تم حذف رسالتك لاحتوائها على كلمات غير لائقة!`
            );
            
            // حذف التحذير بعد 5 ثواني
            setTimeout(() => {
                bot.deleteMessage(msg.chat.id, warning.message_id).catch(() => {});
            }, 5000);
            
        } catch (error) {
            console.error('خطأ في الحذف:', error);
        }
    }
    
    // ترحيب عند إضافة البوت
    if (msg.new_chat_members) {
        const me = await bot.getMe();
        const added = msg.new_chat_members.find(m => m.id === me.id);
        
        if (added) {
            bot.sendMessage(msg.chat.id, `
🎉 شكراً لإضافتي!

📝 الأوامر:
• بحث [اسم] - يوتيوب
• صورة [اسم] - صور
• همس [نص] - رد على شخص

🛡️ سأحذف الشتائم تلقائياً
            `);
        }
    }
});

// ==================== دوال مساعدة ====================
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// منع النوم على Render
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('🤖 Bot is running!');
});
server.listen(3000, () => {
    console.log('🌐 Server running on port 3000');
});

console.log('✅ جاهز!');
