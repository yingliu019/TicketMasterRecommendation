package db;

import db.mongodb.MongoDBConnection;
import db.mysql.*;

public class DBConnectionFactory {
	// This should change based on the pipeline.
	private static final String DEFAULT_DB = "mysql"; //"mysql";
	
	public static DBConnection getConnection(String db) {
		switch (db) {
		case "mysql":
			// return new MySQLConnection();
			return new MYSQLConnection();
		case "mongodb":
			return new MongoDBConnection();
		default:
			throw new IllegalArgumentException("Invalid db:" + db);
		}

	}

	public static DBConnection getConnection() {
		return getConnection(DEFAULT_DB);
	}
}
