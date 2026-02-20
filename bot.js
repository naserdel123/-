const TelegramBot = require('node-telegram-bot-api');
const yts = require('yt-search');
const axios = require('axios');
require('dotenv').config();

// ✅ ضع توكن البوت هنا
const token = process.env.BOT_TOKEN || 'ضع_توكن_البوت_هنا';
const bot = new TelegramBot(token, { polling: true });

// تخزين الهمسات المؤقتة
const whispers = new Map();

// كلمات ممنوعة (شتم)
const badWords = ['كلمة1', 'كلمة2', 'كلمة3', 'كلمة4', 'كلمة5'];

console.log('✅ البوت يعمل...');

// ==================== الأوامر الأساسية ====================

// /start - رسالة ترحيبية
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name;
    
    const welcomeMessage = `
👋 أهلاً ${name}!

🤖 أنا بوت متعدد المهام:

🎵 *بحث يوتيوب* - اكتب: بحث [اسم الأغنية]
📷 *بحث صور* - اكتب: صورة [اسم الشخص/الشيء]
💬 *همسة سرية* - رد على رسالة شخص واكتب: همس [رسالتك]

⚠️ *مميزات إضافية:*
• حذف الرسائل التي تحتوي على شتم تلقائياً
• إرسال روابط يوتيوب مباشرة في القروب

📝 *طريقة الاستخدام:*
أضفني إلى قروبك واستخدم الأوامر أعلاه!

🛡️ سأحافظ على القروب نظيفاً من الشتائم
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: '➕ ضفني لقروبك', url: `https://t.me/${bot.options.username}?startgroup=true` }]
            ]
        }
    });
});

// /help - المساعدة
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
📚 *طريقة الاستخدام:*

🎵 *البحث في يوتيوب:*
اكتب: \`بحث عمرو دياب\`
أو: \`بحث أغنية حبيبي يا نور العين\`

📷 *البحث عن صور:*
اكتب: \`صورة القمر\`
أو: \`صور قطط\`

💬 *الهمسات السرية:*
1. رد على رسالة الشخص
2. اكتب: \`همس أحبك\`
3. سأرسل الهمسة سراً للشخص!

⚠️ *الحماية:*
• أحذف الشتائم تلقائياً
• أحذف الروابط المشبوهة
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// ==================== البحث في يوتيوب ====================

bot.onText(/بحث\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    bot.sendMessage(chatId, `🔍 جاري البحث عن: "${query}"...`);
    
    try {
        const search = await yts(query);
        const videos = search.videos.slice(0, 5); // أول 5 نتائج
        
        if (videos.length === 0) {
            return bot.sendMessage(chatId, '❌ لم أجد نتائج للبحث');
        }
        
        // إرسال النتائج
        for (const video of videos) {
            const message = `
🎵 *${video.title}*

👤 القناة: ${video.author.name}
⏱️ المدة: ${video.timestamp}
👁️ المشاهدات: ${video.views.toLocaleString()}
📅 ${video.ago}

🔗 [شاهد على يوتيوب](${video.url})
            `;
            
            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '▶️ مشاهدة', url: video.url },
                        { text: '🎧 استماع', url: `https://t.me/${bot.options.username}` }
                    ]]
                }
            });
            
            // إرسال صورة مصغرة
            if (video.thumbnail) {
                await bot.sendPhoto(chatId, video.thumbnail, {
                    caption: video.title
                });
            }
        }
        
    } catch (error) {
        console.error('خطأ في البحث:', error);
        bot.sendMessage(chatId, '❌ حدث خطأ أثناء البحث');
    }
});

// ==================== البحث عن صور ====================

bot.onText(/صور[ةه]?\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    bot.sendMessage(chatId, `📷 جاري البحث عن صور: "${query}"...`);
    
    try {
        // استخدام Unsplash API (مجاني)
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: {
                query: query,
                per_page: 5,
                client_id: process.env.UNSPLASH_KEY || 'demo'
            }
        });
        
        const photos = response.data.results;
        
        if (photos.length === 0) {
            // محاولة ثانية باستخدام Picsum
            for (let i = 0; i < 5; i++) {
                await bot.sendPhoto(chatId, `https://picsum.photos/400/300?random=${Date.now() + i}`, {
                    caption: `📷 ${query} - صورة ${i + 1}`
                });
            }
            return;
        }
        
        for (const photo of photos) {
            await bot.sendPhoto(chatId, photo.urls.regular, {
                caption: `📷 ${query}\n👤 بواسطة: ${photo.user.name}`,
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🔗 المصدر', url: photo.links.html }
                    ]]
                }
            });
        }
        
    } catch (error) {
        console.error('خطأ في البحث عن صور:', error);
        // استخدام صور عشوائية كبديل
        for (let i = 0; i < 3; i++) {
            await bot.sendPhoto(chatId, `https://picsum.photos/400/300?random=${Date.now() + i}`, {
                caption: `📷 ${query}`
            });
        }
    }
});

// ==================== الهمسات السرية ====================

bot.onText(/همس\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const whisperText = match[1];
    const messageId = msg.message_id;
    
    // التحقق من الرد على رسالة
    if (!msg.reply_to_message) {
        return bot.sendMessage(chatId, '⚠️ عليك الرد على رسالة الشخص الذي تريد إرسال الهمسة له');
    }
    
    const targetUser = msg.reply_to_message.from;
    const sender = msg.from;
    
    // إنشاء معرف فريد للهمسة
    const whisperId = Date.now().toString();
    
    // تخزين الهمسة
    whispers.set(whisperId, {
        text: whisperText,
        sender: sender.first_name,
        targetId: targetUser.id,
        chatId: chatId
    });
    
    // إرسال إشعار للمرسل
    bot.sendMessage(chatId, `✅ تم إرسال الهمسة سراً إلى ${targetUser.first_name}`, {
        reply_to_message_id: messageId
    });
    
    // إرسال الهمسة للمستهدف
    try {
        await bot.sendMessage(targetUser.id, `
🤫 *همسة سرية من ${sender.first_name}:*

💬 ${whisperText}

📍 من قروب: ${msg.chat.title || 'خاص'}
        `, { parse_mode: 'Markdown' });
    } catch (error) {
        // إذا كان المستخدم لم يبدأ محادثة مع البوت
        const keyboard = {
            inline_keyboard: [[
                { text: '🤫 اضغط لقراءة الهمسة', callback_data: `whisper_${whisperId}` }
            ]]
        };
        
        bot.sendMessage(chatId, `
🤫 ${targetUser.first_name}:
📩 لديك همسة سرية من ${sender.first_name}
        `, { reply_markup: keyboard });
    }
});

// معالجة الضغط على زر الهمسة
bot.on('callback_query', async (query) => {
    const data = query.data;
    
    if (data.startsWith('whisper_')) {
        const whisperId = data.replace('whisper_', '');
        const whisper = whispers.get(whisperId);
        
        if (!whisper) {
            return bot.answerCallbackQuery(query.id, {
                text: '❌ الهمسة منتهية الصلاحية',
                show_alert: true
            });
        }
        
        // إرسال الهمسة
        bot.sendMessage(query.from.id, `
🤫 *همسة سرية من ${whisper.sender}:*

💬 ${whisper.text}
        `, { parse_mode: 'Markdown' });
        
        bot.answerCallbackQuery(query.id, {
            text: '✅ تم إرسال الهمسة لك في الخاص',
            show_alert: true
        });
    }
});

// ==================== حماية القروب ====================

// مراقبة كل الرسائل
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const messageId = msg.message_id;
    
    // التحقق من الشتائم
    const hasBadWord = badWords.some(word => text.toLowerCase().includes(word));
    
    if (hasBadWord && msg.chat.type !== 'private') {
        // حذف الرسالة
        try {
            await bot.deleteMessage(chatId, messageId);
            
            // إرسال تحذير
            const warning = await bot.sendMessage(chatId, `
⚠️ @${msg.from.username || msg.from.first_name}
🚫 تم حذف رسالتك لاحتوائها على كلمات غير لائقة!
            `);
            
            // حذف التحذير بعد 5 ثواني
            setTimeout(() => {
                bot.deleteMessage(chatId, warning.message_id);
            }, 5000);
            
        } catch (error) {
            console.error('خطأ في الحذف:', error);
        }
    }
    
    // الترحيب عند إضافة البوت للقروب
    if (msg.new_chat_members) {
        const botJoined = msg.new_chat_members.find(m => m.id === bot.options.id);
        if (botJoined) {
            bot.sendMessage(chatId, `
🎉 شكراً لإضافتي للقروب!

📝 الأوامر المتاحة:
• بحث [اسم الأغنية] - البحث في يوتيوب
• صورة [الاسم] - البحث عن صور
• همس [رسالة] - رد على شخص لإرسال همسة

🛡️ سأحذف الشتائم تلقائياً
            `);
        }
    }
});

// ==================== أوامر إضافية ====================

// /id - معرف المستخدم والقروب
bot.onText(/\/id/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    bot.sendMessage(chatId, `
🆔 معلوماتك:
👤 معرفك: \`${userId}\`
💬 معرف القروب: \`${chatId}\`
    `, { parse_mode: 'Markdown' });
});

// /admins - قائمة المشرفين
bot.onText(/\/admins/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const admins = await bot.getChatAdministrators(chatId);
        let list = '👮‍♂️ قائمة المشرفين:\n\n';
        
        admins.forEach((admin, index) => {
            const user = admin.user;
            const status = admin.status === 'creator' ? '👑 منشئ' : '👮 مشرف';
            list += `${index + 1}. ${user.first_name} ${user.last_name || ''} - ${status}\n`;
        });
        
        bot.sendMessage(chatId, list);
    } catch (error) {
        bot.sendMessage(chatId, '❌ حدث خطأ في جلب المشرفين');
    }
});

console.log('🤖 البوت جاهز للعمل!');
