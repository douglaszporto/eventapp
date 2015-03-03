package controllers;

import play.*;
import play.mvc.*;

import java.util.*;
import java.text.SimpleDateFormat;

import models.*;
import classes.*;

public class EventDate extends Controller {

	public static void List(){
		List<EventDateModel> events = EventDateModel.find("ORDER BY id ASC").fetch();
		renderJSON(events,EventDateSerializer.getInstance());
	}

	public static void OnDate(Integer year, Integer month, Integer day){

		if(year < 1970 || year > 9999)
			error("Ano incorreto");

		if(month < 0 || month > 12)
			error("Mês incorreto");

		if(day < 1 || day > 31)
			error("Dia incorreto");

		Date d = new Date(year - 1900, month, day);
		
		List<EventDateModel> events = EventDateModel.find("date",d).fetch();
		renderJSON(events,EventDateSerializer.getInstance());

	}

	public static void Load(Long id){
		EventDateModel e = EventDateModel.findById(id);

		if(e == null)
			error("Não encontrado Evento ID #"+id);
		else
			renderJSON(e,EventDateSerializer.getInstance());
	}

    public static void Save(long id, String title, String desc, String local, Date date, String time, Integer remind) {
        EventDateModel e = EventDateModel.findById(id);
		
		if(e == null){
			e = new EventDateModel(title, desc, local, date, time, remind);
		}else{
			e.title  = title;
			e.desc   = desc;
			e.local  = local;
			e.date   = date;
			e.time   = time;
			e.remind = remind;
		}

		e.save();

		if(e != null)
			renderJSON(e,EventDateSerializer.getInstance());
		else
			error("Não foi possível inserir o Evento");
    }

}