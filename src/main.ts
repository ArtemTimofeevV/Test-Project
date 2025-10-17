import TelegramBot, { Message, User } from 'node-telegram-bot-api';
import { BOT_API_TOKEN, ADMIN_ACCESS_KEY } from './config';
import { pool } from './db';

if (!BOT_API_TOKEN) {
    throw new Error('BOT_API_TOKEN is not defined in your .env file');
}

if (!ADMIN_ACCESS_KEY) {
    throw new Error('ADMIN_ACCESS_KEY is not defined in your .env file');
}

type UserState =
    | { step: 'register_role' }
    | { step: 'register_last_name', role: 'user' | 'admin' }
    | { step: 'register_first_name', role: 'user' | 'admin', lastName: string }
    | { step: 'register_dob', role: 'user' | 'admin', lastName: string, firstName: string }
    | { step: 'register_admin_key', lastName: string, firstName: string, dob: string }
    | { step: 'report_title' }
    | { step: 'report_description', title: string }
    | { step: 'report_ask_pros_cons', title: string, description: string }
    | { step: 'report_pros', title: string, description: string }
    | { step: 'report_cons', title: string, description: string, pros: string }
    | { step: 'report_start_date', title: string, description: string, pros?: string, cons?: string }
    | { step: 'report_end_date', title: string, description: string, startDate: string, pros?: string, cons?: string }
    | { step: 'admin_view_by_tag' }
    | { step: 'admin_view_by_name' }
    | { step: 'admin_view_by_date' };

const userStates: { [chatId: number]: UserState } = {};
const bot = new TelegramBot(BOT_API_TOKEN, { polling: true });

const parseDbDate = (dateString: string): string | null => {
    const parts = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!parts) return null;
    const [, day, month, year] = parts;
    return `${year}-${month}-${day}`;
};

const findUser = async (telegramId: number) => {
    const res = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    return res.rows[0];
};

const createUser = async (user: User, details: { lastName: string, firstName: string, dob: string, isAdmin: boolean }) => {
    const { lastName, firstName, dob, isAdmin } = details;
    const res = await pool.query(
        'INSERT INTO users (telegram_id, telegram_username, first_name, last_name, date_of_birth, is_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user.id, user.username || null, firstName, lastName, dob, isAdmin]
    );
    return res.rows[0];
};

const createReport = async (userId: number, report: { title: string, description: string, pros?: string, cons?: string, task_start_date: string, task_end_date: string }) => {
    const { title, description, pros, cons, task_start_date, task_end_date } = report;
    await pool.query(
        'INSERT INTO reports (user_id, title, description, pros, cons, task_start_date, task_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, title, description, pros || null, cons || null, task_start_date, task_end_date]
    );
};

const formatReport = (report: any, userInfo: any) => {
    const toDisplayDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }

    let reportText = `
Date: ${new Date(report.created_at).toLocaleString()}
__________________________
<b>Title:</b> ${report.title}
<b>Description:</b> ${report.description}
`;
    if (report.pros && report.cons) {
        reportText += `
<pre>
|   +   |   -   |
|-------|-------|
| ${report.pros.padEnd(5)} | ${report.cons.padEnd(5)} |
</pre>
`;
    }
    reportText += `
<b>Task period:</b> ${toDisplayDate(report.task_start_date)} - ${toDisplayDate(report.task_end_date)}
__________________________
<b>Completed By:</b> ${userInfo.last_name} ${userInfo.first_name} (@${userInfo.telegram_username || 'N/A'})
`;
    return reportText;
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    if (!user) return;

    const dbUser = await findUser(user.id);

    if (dbUser) {
        if (dbUser.is_admin) {
            sendAdminKeyboard(chatId);
        } else {
            sendUserKeyboard(chatId);
        }
    } else {
        userStates[chatId] = { step: 'register_role' };
        bot.sendMessage(chatId, 'Welcome! Please select your role:', {
            reply_markup: {
                inline_keyboard: [[
                    { text: 'User', callback_data: 'register_role_user' },
                    { text: 'Administrator', callback_data: 'register_role_admin' }
                ]]
            }
        });
    }
});

const sendUserKeyboard = (chatId: number) => {
    bot.sendMessage(chatId, 'You are logged in as a User. You can create a new report.', {
        reply_markup: {
            keyboard: [[{ text: 'Create Report' }]],
            resize_keyboard: true,
        }
    });
};

const sendAdminKeyboard = (chatId: number) => {
    bot.sendMessage(chatId, 'You are logged in as an Administrator. Please select an action:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'View User Report', callback_data: 'admin_view_user_report' }],
                [{ text: 'Reports by Date', callback_data: 'admin_view_by_date' }],
                [{ text: 'All Reports', callback_data: 'admin_view_all' }]
            ]
        }
    });
};

bot.on('message', async (msg: Message) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    const text = msg.text;

    if (!user || !text || text === '/start') return;

    const state = userStates[chatId];
    if (!state) {
        const dbUser = await findUser(user.id);
        if (dbUser) {
            if (dbUser.is_admin) {
                 if (text === 'Create Report') {
                    bot.sendMessage(chatId, 'Administrators cannot create reports.');
                 }
            } else {
                if (text === 'Create Report') {
                    userStates[chatId] = { step: 'report_title' };
                    bot.sendMessage(chatId, 'Enter the report title:');
                }
            }
        }
        return;
    }

    switch (state.step) {
        // Registration
        case 'register_last_name':
            userStates[chatId] = { ...state, step: 'register_first_name', lastName: text };
            bot.sendMessage(chatId, 'Enter your first name:');
            break;
        case 'register_first_name':
            userStates[chatId] = { ...state, step: 'register_dob', firstName: text };
            bot.sendMessage(chatId, 'Enter your date of birth (DD.MM.YYYY):');
            break;
        case 'register_dob':
            const dob = parseDbDate(text);
            if (!dob) {
                bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            if (state.role === 'admin') {
                userStates[chatId] = { step: 'register_admin_key', lastName: state.lastName, firstName: state.firstName, dob: dob };
                bot.sendMessage(chatId, 'Enter the admin access key:');
            } else {
                await createUser(user, { lastName: state.lastName, firstName: state.firstName, dob: dob, isAdmin: false });
                await bot.sendMessage(chatId, 'Registration complete!');
                delete userStates[chatId];
                sendUserKeyboard(chatId);
            }
            break;
        case 'register_admin_key':
            if (text === ADMIN_ACCESS_KEY) {
                await createUser(user, { lastName: state.lastName, firstName: state.firstName, dob: state.dob, isAdmin: true });
                await bot.sendMessage(chatId, 'Administrator registration complete!');
                delete userStates[chatId];
                sendAdminKeyboard(chatId);
            } else {
                delete userStates[chatId];
                bot.sendMessage(chatId, 'Invalid access key. Registration cancelled.');
            }
            break;

        // Report Creation
        case 'report_title':
            userStates[chatId] = { step: 'report_description', title: text };
            bot.sendMessage(chatId, 'Enter the report description:');
            break;
        case 'report_description':
            userStates[chatId] = { step: 'report_ask_pros_cons', title: state.title, description: text };
            bot.sendMessage(chatId, 'Would you like to add Pros and Cons?', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Yes', callback_data: 'report_add_pros_cons_yes' },
                        { text: 'No', callback_data: 'report_add_pros_cons_no' }
                    ]]
                }
            });
            break;
        case 'report_pros':
            userStates[chatId] = { ...state, step: 'report_cons', pros: text };
            bot.sendMessage(chatId, 'Enter the Cons:');
            break;
        case 'report_cons':
            userStates[chatId] = { ...state, step: 'report_start_date', cons: text };
            bot.sendMessage(chatId, 'Enter the task start date (DD.MM.YYYY):');
            break;
        case 'report_start_date':
            const startDate = parseDbDate(text);
            if (!startDate) {
                bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            userStates[chatId] = { ...state, step: 'report_end_date', startDate: startDate };
            bot.sendMessage(chatId, 'Enter the task end date (DD.MM.YYYY):');
            break;
        case 'report_end_date':
            const endDate = parseDbDate(text);
            if (!endDate) {
                bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            
            const dbUser = await findUser(user.id);
            if (!dbUser) return;

            const reportData = { 
                ...state, 
                task_start_date: state.startDate,
                task_end_date: endDate
            };
            await createReport(dbUser.id, reportData);

            const finalReport = formatReport({ ...reportData, created_at: new Date() }, dbUser);
            await bot.sendMessage(chatId, finalReport, { parse_mode: 'HTML' });

            delete userStates[chatId];
            sendUserKeyboard(chatId);
            break;

        case 'admin_view_by_tag':
            const username = text.startsWith('@') ? text.substring(1) : text;
            const resByTag = await pool.query('SELECT * FROM reports WHERE user_id = (SELECT id FROM users WHERE telegram_username = $1)', [username]);
            if (resByTag.rows.length === 0) {
                bot.sendMessage(chatId, `No reports found for user @${username}.`);
            } else {
                for (const report of resByTag.rows) {
                    const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                    bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
                }
            }
            delete userStates[chatId];
            break;
        case 'admin_view_by_name':
            const [lastName, firstName] = text.split(' ');
            if (!lastName || !firstName) {
                bot.sendMessage(chatId, 'Please enter the Last Name and First Name, separated by a space.');
                return;
            }
            const resByName = await pool.query('SELECT * FROM reports WHERE user_id = (SELECT id FROM users WHERE last_name = $1 AND first_name = $2)', [lastName, firstName]);
             if (resByName.rows.length === 0) {
                bot.sendMessage(chatId, `No reports found for user ${lastName} ${firstName}.`);
            } else {
                for (const report of resByName.rows) {
                    const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                    bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
                }
            }
            delete userStates[chatId];
            break;
        case 'admin_view_by_date':
            const searchDate = parseDbDate(text);
            if (!searchDate) {
                bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            const resByDate = await pool.query('SELECT * FROM reports WHERE $1 BETWEEN task_start_date AND task_end_date', [searchDate]);
             if (resByDate.rows.length === 0) {
                bot.sendMessage(chatId, `No reports found for the date ${text}.`);
            } else {
                 bot.sendMessage(chatId, `Reports for ${text}:`);
                for (const report of resByDate.rows) {
                    const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                    bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
                }
            }
            delete userStates[chatId];
            break;
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data;

    if (!data) return;

    if (data.startsWith('register_role_')) {
        const role = data.replace('register_role_', '') as 'user' | 'admin';
        userStates[chatId] = { step: 'register_last_name', role };
        bot.sendMessage(chatId, 'Enter your last name:');
        bot.answerCallbackQuery(query.id);
        return;
    }

    const state = userStates[chatId];
    if (state?.step === 'report_ask_pros_cons') {
        if (data === 'report_add_pros_cons_yes') {
            userStates[chatId] = { ...state, step: 'report_pros' };
            bot.sendMessage(chatId, 'Enter the Pros:');
        } else { // No
            userStates[chatId] = { ...state, step: 'report_start_date' };
            bot.sendMessage(chatId, 'Enter the task start date (DD.MM.YYYY):');
        }
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (data === 'admin_view_user_report') {
        bot.sendMessage(chatId, 'Choose a search method:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'By Tag', callback_data: 'admin_search_by_tag' }],
                    [{ text: 'By Name', callback_data: 'admin_search_by_name' }]
                ]
            }
        });
    } else if (data === 'admin_search_by_tag') {
        userStates[chatId] = { step: 'admin_view_by_tag' };
        bot.sendMessage(chatId, 'Enter the user\'s tag (e.g., @username):');
    } else if (data === 'admin_search_by_name') {
        userStates[chatId] = { step: 'admin_view_by_name' };
        bot.sendMessage(chatId, 'Enter the user\'s Last and First Name, separated by a space:');
    } else if (data === 'admin_view_by_date') {
        userStates[chatId] = { step: 'admin_view_by_date' };
        bot.sendMessage(chatId, 'Enter the date to view reports (DD.MM.YYYY):');
    } else if (data === 'admin_view_all') {
        const res = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
        if (res.rows.length === 0) {
            bot.sendMessage(chatId, 'No reports yet.');
        } else {
            bot.sendMessage(chatId, 'All reports:');
            for (const report of res.rows) {
                const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
            }
        }
    }

    bot.answerCallbackQuery(query.id);
});


console.log('Bot has been started...');

process.on('SIGINT', () => {
    console.log('Shutting down...');
    pool.end(() => {
        console.log('Database pool has been closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    pool.end(() => {
        console.log('Database pool has been closed.');
        process.exit(0);
    });
});