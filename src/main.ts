


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
    | { step: 'report_pros', title: string, description: string, pros: string[] }
    | { step: 'report_cons', title: string, description: string, pros: string[], cons: string[] }
    | { step: 'report_start_date', title: string, description: string, pros: string[], cons: string[] }
    | { step: 'report_end_date', title: string, description: string, startDate: string, pros: string[], cons: string[] }
    | { step: 'report_confirm', reportData: any, dbUser: any }
    | { step: 'report_edit_title', reportData: any, dbUser: any }
    | { step: 'report_edit_description', reportData: any, dbUser: any }
    | { step: 'report_edit_start_date', reportData: any, dbUser: any }
    | { step: 'report_edit_end_date', reportData: any, dbUser: any, startDate: string }
    | { step: 'report_edit_pros_menu', reportData: any, dbUser: any }
    | { step: 'report_edit_pros_add', reportData: any, dbUser: any }
    | { step: 'report_edit_pros_select_for_edit', reportData: any, dbUser: any }
    | { step: 'report_edit_pros_edit', reportData: any, dbUser: any, index: number }
    | { step: 'report_edit_pros_select_for_delete', reportData: any, dbUser: any }
    | { step: 'report_edit_cons_menu', reportData: any, dbUser: any }
    | { step: 'report_edit_cons_add', reportData: any, dbUser: any }
    | { step: 'report_edit_cons_select_for_edit', reportData: any, dbUser: any }
    | { step: 'report_edit_cons_edit', reportData: any, dbUser: any, index: number }
    | { step: 'report_edit_cons_select_for_delete', reportData: any, dbUser: any }
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

const createReport = async (userId: number, report: { title: string, description: string, pros?: string[], cons?: string[], task_start_date: string, task_end_date: string }) => {
    const { title, description, pros, cons, task_start_date, task_end_date } = report;
    await pool.query(
        'INSERT INTO reports (user_id, title, description, pros, cons, task_start_date, task_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, title, description, pros?.join('\n') || null, cons?.join('\n') || null, task_start_date, task_end_date]
    );
};

const escapeHtml = (unsafe: string): string => {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

const formatReport = (report: any, userInfo: any) => {
    const toDisplayDate = (dateStr: string | Date) => {
        if (!dateStr) return 'N/A';
        let date: string;
        if (dateStr instanceof Date) {
            date = dateStr.toISOString().split('T')[0];
        } else {
            date = dateStr;
        }
        const [year, month, day] = date.split('-');
        return `${day}.${month}.${year}`;
    }

    let pros = report.pros ? (typeof report.pros === 'string' ? report.pros.split('\n') : report.pros) : [];
    let cons = report.cons ? (typeof report.cons === 'string' ? report.cons.split('\n') : report.cons) : [];

    let reportText = `\nDate: ${new Date(report.created_at).toLocaleString()}\n__________________________\n<b>Title:</b> ${escapeHtml(report.title)}\n<b>Description:</b> ${escapeHtml(report.description)}\n`;
    if (pros.length > 0 || cons.length > 0) {
        reportText += `\n<pre>\n|    +    |    -    |\n|---------|---------|\n`;
        const maxRows = Math.max(pros.length, cons.length);
        for (let i = 0; i < maxRows; i++) {
            const pro = i < pros.length ? escapeHtml(pros[i]) : '';
            const con = i < cons.length ? escapeHtml(cons[i]) : '';
            reportText += `| ${pro.padEnd(7)} | ${con.padEnd(7)} |\n`;
        }
        reportText += `</pre>\n`;
    }
    reportText += `\n<b>Task period:</b> ${toDisplayDate(report.task_start_date)} - ${toDisplayDate(report.task_end_date)}\n__________________________\n<b>Completed By:</b> ${escapeHtml(userInfo.last_name)} ${escapeHtml(userInfo.first_name)} (@${escapeHtml(userInfo.telegram_username) || 'N/A'})\n`;
    return reportText;
};

const sendConfirmation = async (chatId: number, reportData: any, dbUser: any) => {
    userStates[chatId] = { step: 'report_confirm', reportData, dbUser };
    const finalReport = formatReport(reportData, dbUser);
    await bot.sendMessage(chatId, `Is everything right?\n${finalReport}`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[
                { text: 'Yes', callback_data: 'report_confirm_yes' },
                { text: 'No', callback_data: 'report_confirm_no' }
            ]]
        }
    });
}

bot.onText(/.start/, async (msg) => {
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

const sendAdminMenu = (chatId: number) => {
    bot.sendMessage(chatId, 'Please select an action:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'View User Report', callback_data: 'admin_view_user_report' }],
                [{ text: 'Reports by Date', callback_data: 'admin_view_by_date' }],
                [{ text: 'All Reports', callback_data: 'admin_view_all' }]
            ]
        }
    });
};

const sendAdminKeyboard = (chatId: number) => {
    bot.sendMessage(chatId, 'You are logged in as an Administrator.');
    sendAdminMenu(chatId);
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
            bot.sendMessage(chatId, 'Would you like to add + and -?', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Yes', callback_data: 'report_add_pros_cons_yes' },
                        { text: 'No', callback_data: 'report_add_pros_cons_no' }
                    ]]
                }
            });
            break;
        case 'report_pros':
            const newPros = state.pros ? [...state.pros, text] : [text];
            userStates[chatId] = { ...state, pros: newPros };
            bot.sendMessage(chatId, 'Add another "+"?', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Yes', callback_data: 'report_add_pros_yes' },
                        { text: 'No', callback_data: 'report_add_pros_no' }
                    ]]
                }
            });
            break;
        case 'report_cons':
            const newCons = state.cons ? [...state.cons, text] : [text];
            userStates[chatId] = { ...state, cons: newCons };
            bot.sendMessage(chatId, 'Add another "-"?', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Yes', callback_data: 'report_add_cons_yes' },
                        { text: 'No', callback_data: 'report_add_cons_no' }
                    ]]
                }
            });
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
                task_end_date: endDate,
                created_at: new Date()
            };
            
            await sendConfirmation(chatId, reportData, dbUser);
            break;

        case 'report_edit_title':
            const { reportData: currentReportData, dbUser: currentUser } = state;
            const updatedReportData = { ...currentReportData, title: text };
            await sendConfirmation(chatId, updatedReportData, currentUser);
            break;

        case 'report_edit_description':
            const { reportData: currentReportDataDesc, dbUser: currentUserDesc } = state;
            const updatedReportDataDesc = { ...currentReportDataDesc, description: text };
            await sendConfirmation(chatId, updatedReportDataDesc, currentUserDesc);
            break;

        case 'report_edit_start_date':
            const newStartDate = parseDbDate(text);
            if (!newStartDate) {
                bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            userStates[chatId] = { step: 'report_edit_end_date', reportData: state.reportData, dbUser: state.dbUser, startDate: newStartDate };
            bot.sendMessage(chatId, 'Enter the new end date (DD.MM.YYYY):');
            break;

        case 'report_edit_end_date':
            const newEndDate = parseDbDate(text);
            if (!newEndDate) {
                bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            const { reportData: currentReportDataDates, dbUser: currentUserDates, startDate: newStartDateFromState } = state;
            const updatedReportDataDates = { ...currentReportDataDates, task_start_date: newStartDateFromState, task_end_date: newEndDate };
            await sendConfirmation(chatId, updatedReportDataDates, currentUserDates);
            break;

        case 'report_edit_pros_add':
            const { reportData: currentReportDataPros, dbUser: currentUserPros } = state;
            const newProsArray = currentReportDataPros.pros ? [...currentReportDataPros.pros, text] : [text];
            const updatedReportDataPros = { ...currentReportDataPros, pros: newProsArray };
            await sendConfirmation(chatId, updatedReportDataPros, currentUserPros);
            break;

        case 'report_edit_cons_add':
            const { reportData: currentReportDataCons, dbUser: currentUserCons } = state;
            const newConsArray = currentReportDataCons.cons ? [...currentReportDataCons.cons, text] : [text];
            const updatedReportDataCons = { ...currentReportDataCons, cons: newConsArray };
            await sendConfirmation(chatId, updatedReportDataCons, currentUserCons);
            break;

        case 'admin_view_by_date':
            if (text === '/back') {
                delete userStates[chatId];
                sendAdminMenu(chatId);
                return;
            }
            const searchDate = parseDbDate(text);
            if (!searchDate) {
                await bot.sendMessage(chatId, 'Invalid date format. Please use DD.MM.YYYY:');
                return;
            }
            const resByDate = await pool.query('SELECT * FROM reports WHERE $1 BETWEEN task_start_date AND task_end_date', [searchDate]);
             if (resByDate.rows.length === 0) {
                await bot.sendMessage(chatId, `No reports found for the date ${text}.\nTry again`);
            } else {
                 await bot.sendMessage(chatId, `Reports for ${text}:`);
                const reportPromises = resByDate.rows.map(async (report) => {
                    const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                    return bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
                });
                await Promise.all(reportPromises);
                delete userStates[chatId];
                sendAdminMenu(chatId);
            }
            break;
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message!.chat.id;
    const data = query.data;

    if (!data) return;

    if (data === 'admin_back_to_main_menu') {
        delete userStates[chatId];
        sendAdminMenu(chatId);
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (data.startsWith('register_role_')) {
        const role = data.replace('register_role_', '') as 'user' | 'admin';
        userStates[chatId] = { step: 'register_last_name', role };
        bot.sendMessage(chatId, 'Enter your last name:');
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (data === 'admin_view_user_report') {
        bot.sendMessage(chatId, 'Choose a search method:', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'By Tag', callback_data: 'admin_search_by_tag' }],
                    [{ text: 'By Name', callback_data: 'admin_search_by_name' }],
                    [{ text: '/back', callback_data: 'admin_back_to_main_menu' }]
                ]
            }
        });
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data === 'admin_search_by_tag') {
        const users = await pool.query('SELECT telegram_username FROM users WHERE telegram_username IS NOT NULL');
        if (users.rows.length === 0) {
            bot.sendMessage(chatId, 'No users with tags found.');
        } else {
            const userKeyboard = users.rows.map((user: any) => ([{ text: `@${user.telegram_username}`, callback_data: `admin_select_tag_${user.telegram_username}` }]));
            userKeyboard.push([{ text: '/back', callback_data: 'admin_back_to_main_menu' }]);
            bot.sendMessage(chatId, 'Select a user to view reports:', {
                reply_markup: {
                    inline_keyboard: userKeyboard
                }
            });
        }
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data.startsWith('admin_select_tag_')) {
        const username = data.replace('admin_select_tag_', '');
        const resByTag = await pool.query('SELECT * FROM reports WHERE user_id = (SELECT id FROM users WHERE telegram_username = $1)', [username]);
        if (resByTag.rows.length === 0) {
            await bot.sendMessage(chatId, `No reports found for user @${username}.`);
        } else {
            const reportPromises = resByTag.rows.map(async (report) => {
                const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                return bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
            });
            await Promise.all(reportPromises);
        }
        sendAdminMenu(chatId);
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data === 'admin_search_by_name') {
        const lastNames = await pool.query('SELECT DISTINCT last_name FROM users');
        if (lastNames.rows.length === 0) {
            bot.sendMessage(chatId, 'No users found.');
        } else {
            const lastNameKeyboard = lastNames.rows.map((user: any) => ([{ text: user.last_name, callback_data: `admin_select_lastname_${user.last_name}` }]));
            lastNameKeyboard.push([{ text: '/back', callback_data: 'admin_back_to_main_menu' }]);
            bot.sendMessage(chatId, 'Select a last name:', {
                reply_markup: {
                    inline_keyboard: lastNameKeyboard
                }
            });
        }
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data.startsWith('admin_select_lastname_')) {
        const lastName = data.replace('admin_select_lastname_', '');
        const firstNames = await pool.query('SELECT first_name FROM users WHERE last_name = $1', [lastName]);
        if (firstNames.rows.length === 0) {
            bot.sendMessage(chatId, `No users with last name ${lastName} found.`);
        } else {
            const firstNameKeyboard = firstNames.rows.map((user: any) => ([{ text: user.first_name, callback_data: `admin_select_firstname_${lastName}_${user.first_name}` }]));
            firstNameKeyboard.push([{ text: '/back', callback_data: 'admin_back_to_main_menu' }]);
            bot.sendMessage(chatId, `Select a first name for ${lastName}:`, {
                reply_markup: {
                    inline_keyboard: firstNameKeyboard
                }
            });
        }
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data.startsWith('admin_select_firstname_')) {
        const [lastName, firstName] = data.replace('admin_select_firstname_', '').split('_');
        const resByName = await pool.query('SELECT * FROM reports WHERE user_id = (SELECT id FROM users WHERE last_name = $1 AND first_name = $2)', [lastName, firstName]);
        if (resByName.rows.length === 0) {
            await bot.sendMessage(chatId, `No reports found for user ${lastName} ${firstName}.`);
        } else {
            const reportPromises = resByName.rows.map(async (report) => {
                const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                return bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
            });
            await Promise.all(reportPromises);
        }
        sendAdminMenu(chatId);
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data === 'admin_view_by_date') {
        userStates[chatId] = { step: 'admin_view_by_date' };
        bot.sendMessage(chatId, 'Enter the date to view reports (DD.MM.YYYY):', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '/back', callback_data: 'admin_back_to_main_menu' }]
                ]
            }
        });
        bot.answerCallbackQuery(query.id);
        return;
    } else if (data === 'admin_view_all') {
        const res = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
        if (res.rows.length === 0) {
            await bot.sendMessage(chatId, 'No reports yet.');
        } else {
            await bot.sendMessage(chatId, 'All reports:');
            const reportPromises = res.rows.map(async (report) => {
                const reportUser = await pool.query('SELECT * FROM users WHERE id = $1', [report.user_id]);
                return bot.sendMessage(chatId, formatReport(report, reportUser.rows[0]), { parse_mode: 'HTML' });
            });
            await Promise.all(reportPromises);
        }
        sendAdminMenu(chatId);
        bot.answerCallbackQuery(query.id);
        return;
    }

    const state = userStates[chatId];
    if (!state) {
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (state.step === 'report_ask_pros_cons') {
        if (data === 'report_add_pros_cons_yes') {
            userStates[chatId] = { ...state, step: 'report_pros', pros: [] };
            bot.sendMessage(chatId, 'Enter the "+":');
        } else { // No
            userStates[chatId] = { ...state, step: 'report_start_date', pros: [], cons: [] };
            bot.sendMessage(chatId, 'Enter the task start date (DD.MM.YYYY):');
        }
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (state.step === 'report_pros') {
        if (data === 'report_add_pros_yes') {
            bot.sendMessage(chatId, 'Enter the "+":');
        } else if (data === 'report_add_pros_no') {
            userStates[chatId] = { ...state, step: 'report_cons', cons: [] };
            bot.sendMessage(chatId, 'Enter the "-":');
        }
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (state.step === 'report_cons') {
        if (data === 'report_add_cons_yes') {
            bot.sendMessage(chatId, 'Enter the "-":');
        } else if (data === 'report_add_cons_no') {
            userStates[chatId] = { ...state, step: 'report_start_date' };
            bot.sendMessage(chatId, 'Enter the task start date (DD.MM.YYYY):');
        }
        bot.answerCallbackQuery(query.id);
        return;
    }

    if (state.step === 'report_confirm') {
        if (data === 'report_confirm_yes') {
            await createReport(state.dbUser.id, state.reportData);
            bot.sendMessage(chatId, 'Report saved!');
            delete userStates[chatId];
            sendUserKeyboard(chatId);
        } else if (data === 'report_confirm_no') {
            const prosButtons = [];
            if (state.reportData.pros && state.reportData.pros.length > 0) {
                prosButtons.push({ text: 'Edit "+"' , callback_data: 'report_edit_menu_pros' });
            }
            prosButtons.push({ text: 'Add "+"' , callback_data: 'report_edit_menu_pros_add' });

            const consButtons = [];
            if (state.reportData.cons && state.reportData.cons.length > 0) {
                consButtons.push({ text: 'Edit "-"' , callback_data: 'report_edit_menu_cons' });
            }
            consButtons.push({ text: 'Add "-"' , callback_data: 'report_edit_menu_cons_add' });

            bot.sendMessage(chatId, 'What do you want to edit?', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Title', callback_data: 'report_edit_menu_title' }],
                        [{ text: 'Description', callback_data: 'report_edit_menu_description' }],
                        prosButtons,
                        consButtons,
                        [{ text: 'Start-End date', callback_data: 'report_edit_menu_dates' }]
                    ]
                }
            });
        } else if (data === 'report_edit_menu_title') {
            userStates[chatId] = { step: 'report_edit_title', reportData: state.reportData, dbUser: state.dbUser };
            bot.sendMessage(chatId, 'Enter the new title:');
        } else if (data === 'report_edit_menu_description') {
            userStates[chatId] = { step: 'report_edit_description', reportData: state.reportData, dbUser: state.dbUser };
            bot.sendMessage(chatId, 'Enter the new description:');
        } else if (data === 'report_edit_menu_dates') {
            userStates[chatId] = { step: 'report_edit_start_date', reportData: state.reportData, dbUser: state.dbUser };
            bot.sendMessage(chatId, 'Enter the new start date (DD.MM.YYYY):');
        } else if (data === 'report_edit_menu_pros') {
            userStates[chatId] = { step: 'report_edit_pros_menu', reportData: state.reportData, dbUser: state.dbUser };
            const prosKeyboard = state.reportData.pros.map((pro: string, index: number) => ([{ text: pro, callback_data: `report_edit_pros_select_${index}` }]));
            bot.sendMessage(chatId, 'Select "+" to edit:', { reply_markup: { inline_keyboard: prosKeyboard } });
        } else if (data.startsWith('report_edit_pros_select_')) {
            const index = parseInt(data.replace('report_edit_pros_select_', ''));
            userStates[chatId] = { step: 'report_edit_pros_edit', reportData: state.reportData, dbUser: state.dbUser, index };
            bot.sendMessage(chatId, `Enter the new value for "${state.reportData.pros[index]}":`);
        } else if (data === 'report_edit_menu_pros_add') {
            userStates[chatId] = { step: 'report_edit_pros_add', reportData: state.reportData, dbUser: state.dbUser };
            bot.sendMessage(chatId, 'Enter the new "+":');
        } else if (data === 'report_edit_menu_cons') {
            userStates[chatId] = { step: 'report_edit_cons_menu', reportData: state.reportData, dbUser: state.dbUser };
            const consKeyboard = state.reportData.cons.map((con: string, index: number) => ([{ text: con, callback_data: `report_edit_cons_select_${index}` }]));
            bot.sendMessage(chatId, 'Select "-" to edit:', { reply_markup: { inline_keyboard: consKeyboard } });
        } else if (data.startsWith('report_edit_cons_select_')) {
            const index = parseInt(data.replace('report_edit_cons_select_', ''));
            userStates[chatId] = { step: 'report_edit_cons_edit', reportData: state.reportData, dbUser: state.dbUser, index };
            bot.sendMessage(chatId, `Enter the new value for "${state.reportData.cons[index]}":`);
        } else if (data === 'report_edit_menu_cons_add') {
            userStates[chatId] = { step: 'report_edit_cons_add', reportData: state.reportData, dbUser: state.dbUser };
            bot.sendMessage(chatId, 'Enter the new "-":');
        }

        bot.answerCallbackQuery(query.id);
        return;
    }
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

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    bot.stopPolling().then(() => {
        console.log('Bot polling stopped.');
        pool.end(() => {
            console.log('Database pool has been closed.');
            process.exit(0);
        });
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
