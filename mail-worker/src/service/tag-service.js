import orm from '../entity/orm';
import { tag } from '../entity/tag';
import email from '../entity/email';
import { and, asc, eq, inArray, count, ne, sql } from 'drizzle-orm';
import BizError from '../error/biz-error';
import { isDel } from '../const/entity-const';
import { t } from '../i18n/i18n';

const tagService = {

	async add(c, params, userId) {
		const { tagName, color } = params;

		if (!tagName) {
			throw new BizError(t('emptyTagName'));
		}

		if (tagName.length > 20) {
			throw new BizError(t('tagNameTooLong'));
		}

		const exist = await orm(c).select().from(tag).where(
			and(
				eq(tag.userId, userId),
				eq(tag.tagName, tagName)))
			.get();

		if (exist) {
			throw new BizError(t('tagNameExist'));
		}

		const row = await orm(c).insert(tag).values({ userId, tagName, color: color || '' }).returning().get();
		return row;
	},

	async update(c, params, userId) {
		const { tagId, tagName, color, sort } = params;

		const exist = await orm(c).select().from(tag).where(
			and(
				eq(tag.tagId, tagId),
				eq(tag.userId, userId)))
			.get();

		if (!exist) {
			throw new BizError(t('tagNotExist'));
		}

		if (tagName && tagName.length > 20) {
			throw new BizError(t('tagNameTooLong'));
		}

		if (tagName) {
			const sameName = await orm(c).select().from(tag).where(
				and(
					eq(tag.userId, userId),
					eq(tag.tagName, tagName),
					ne(tag.tagId, tagId)))
				.get();

			if (sameName) {
				throw new BizError(t('tagNameExist'));
			}
		}

		const values = {};
		if (tagName) values.tagName = tagName;
		if (color !== undefined) values.color = color;
		if (sort !== undefined) values.sort = sort;

		await orm(c).update(tag).set(values).where(eq(tag.tagId, tagId)).run();
	},

	async delete(c, params, userId) {
		const { tagId } = params;

		const exist = await orm(c).select().from(tag).where(
			and(
				eq(tag.tagId, tagId),
				eq(tag.userId, userId)))
			.get();

		if (!exist) {
			throw new BizError(t('tagNotExist'));
		}

		await orm(c).delete(tag).where(eq(tag.tagId, tagId)).run();
		// 该标签下的邮件恢复为未分类
		await orm(c).update(email).set({ tagId: 0 }).where(eq(email.tagId, tagId)).run();
	},

	async list(c, params, userId) {
		const list = await orm(c).select({
			tagId: tag.tagId,
			tagName: tag.tagName,
			color: tag.color,
			sort: tag.sort,
			createTime: tag.createTime,
			emailCount: sql`(SELECT COUNT(*) FROM email WHERE email.tag_id = tag.tag_id AND email.user_id = ${userId} AND email.is_del = ${isDel.NORMAL})`.as('emailCount')
		}).from(tag)
			.where(eq(tag.userId, userId))
			.orderBy(asc(tag.sort), asc(tag.tagId))
			.all();

		return { list };
	},

	async bind(c, params, userId) {
		const { emailIds, tagId } = params;

		if (!tagId) {
			throw new BizError(t('tagNotExist'));
		}

		const idList = (Array.isArray(emailIds) ? emailIds : String(emailIds).split(',')).map(Number);

		if (idList.length === 0) {
			return;
		}

		const tagRow = await orm(c).select().from(tag).where(
			and(
				eq(tag.tagId, tagId),
				eq(tag.userId, userId)))
			.get();

		if (!tagRow) {
			throw new BizError(t('tagNotExist'));
		}

		await orm(c).update(email).set({ tagId }).where(
			and(
				eq(email.userId, userId),
				inArray(email.emailId, idList)))
			.run();
	},

	async unbind(c, params, userId) {
		const { emailIds } = params;

		const idList = (Array.isArray(emailIds) ? emailIds : String(emailIds).split(',')).map(Number);

		if (idList.length === 0) {
			return;
		}

		await orm(c).update(email).set({ tagId: 0 }).where(
			and(
				eq(email.userId, userId),
				inArray(email.emailId, idList)))
			.run();
	},

	async removeByEmailIds(c, emailIds) {
		await orm(c).update(email).set({ tagId: 0 }).where(inArray(email.emailId, emailIds)).run();
	}
};

export default tagService;
