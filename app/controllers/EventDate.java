package controllers;

import play.*;
import play.mvc.*;

import java.util.*;
import java.text.SimpleDateFormat;

import models.*;
import classes.*;

public class EventDate extends Controller {

	public static void list() {
		List<EventDateModel> events = EventDateModel.find("ORDER BY id ASC")
				.fetch();
		renderJSON(events, EventDateSerializer.getInstance());
	}

	public static void monthResume(int year, int month) {
		final Calendar calendar = Calendar.getInstance();
		final Date firtsDay = new Date(year - 1900, month, 1);
		final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		Map<String, Integer> eventsByDate = new HashMap<String, Integer>();
		Date lastDay;
		List<EventDateModel> events;
		String dateToIndex;
		Integer numOfEvents;

		calendar.setTime(firtsDay);

		calendar.add(Calendar.MONTH, 1);
		calendar.add(Calendar.DATE, -1);

		lastDay = calendar.getTime();

		events = EventDateModel.find("byEventdateBetween", lastDay, firtsDay)
				.fetch();

		for (EventDateModel event : events) {
			dateToIndex = dateFormat.format(event.eventDate);
			numOfEvents = eventsByDate.get(dateToIndex);
			if (numOfEvents != null) {
				eventsByDate.put(dateToIndex, numOfEvents + 1);
			} else {
				eventsByDate.put(dateToIndex, 1);
			}
		}

		renderJSON(eventsByDate);
	}

	public static void onDate(Integer year, Integer month, Integer day) {

		if (year < 1900 || year > 9999) {
			error("Ano incorreto");
		}

		if (month < 0 || month > 12) {
			error("Mês incorreto");
		}

		if (day < 1 || day > 31) {
			error("Dia incorreto");
		}

		Date d = new Date(year - 1900, month, day);

		List<EventDateModel> events = EventDateModel.find("eventDate", d)
				.fetch();
		renderJSON(events, EventDateSerializer.getInstance());

	}

	public static void load(Long id) {
		EventDateModel e = EventDateModel.findById(id);

		if (e == null) {
			error("Não encontrado Evento ID #" + id);
		} else {
			renderJSON(e, EventDateSerializer.getInstance());
		}
	}

	public static void delete(Long id) {
		EventDateModel e = EventDateModel.findById(id);

		if (e == null) {
			error("Não encontrado Evento ID #" + id);
		} else {
			e.delete();
			renderText("1");
		}
	}

	public static void save(EventDateModel ev, List<UserModel> participants) {
		ev.setParticipants(participants);
		ev.save();

		if (ev != null) {
			renderJSON(ev, EventDateSerializer.getInstance());
		} else {
			error("Não foi possível inserir o Evento");
		}
	}

}