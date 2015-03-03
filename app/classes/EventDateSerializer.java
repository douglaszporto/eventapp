package classes;

import play.*;
import models.*;
import com.google.gson.*;
import java.lang.reflect.*;
import java.text.SimpleDateFormat;

public class EventDateSerializer implements JsonSerializer<EventDateModel>{

	static EventDateSerializer instance;

	public static EventDateSerializer getInstance(){
		if(instance == null)
			instance = new EventDateSerializer();

		return instance;
	}

	@Override
	public JsonElement serialize(final EventDateModel eventdate, final Type type, final JsonSerializationContext context){
		final JsonObject       obj     = new JsonObject();
		final SimpleDateFormat formato = new SimpleDateFormat("dd/MM/yyyy");

		final String date_formated = eventdate.eventdate == null ? "" : formato.format(eventdate.eventdate);

		obj.addProperty("id", eventdate.id);
		obj.addProperty("title", eventdate.title);
		obj.addProperty("desc", eventdate.description);
		obj.addProperty("local", eventdate.local);
		obj.addProperty("date", date_formated);
		obj.addProperty("time", eventdate.eventtime);
		obj.addProperty("remind", eventdate.remind);

		return obj;
	}

}