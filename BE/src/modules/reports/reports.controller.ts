import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ReportService } from './reports.service';

export class ReportController {
	constructor(private readonly reportService = new ReportService()) {}

	exportReport = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { month, year, format } = req.query as {
				month: string;
				year: string;
				format: 'excel' | 'pdf';
			};

			const buffer = await this.reportService.exportMonthlyReport(
				(req.user as any).id,
				Number(month),
				Number(year),
				format,
			);

			const filename = `bao-cao-${year}-${month.padStart(2, '0')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

			res.setHeader(
				'Content-Type',
				format === 'pdf'
					? 'application/pdf'
					: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			);
			res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
			res.status(StatusCodes.OK).send(buffer);
		} catch (error) {
			next(error);
		}
	};
}
